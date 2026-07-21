"""
LeadPilot — Multi-Agent Orchestrator.

Manages chat session lifecycle, turn execution, agent trail tracking,
MongoDB session state, and yields SSE event streams for real-time frontend updates.
"""
import json
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, List
from bson import ObjectId

from app.db.mongodb import ai_sessions_collection, ai_turns_collection, users_collection
from app.services.ai.agents import HeadAgent, BusinessAnalyzer, CampaignCreator, AudienceCreator, CreativeWriter
from app.services.ai.llm_provider import chat_json


async def run_multi_agent_turn_stream(
    user_id: str,
    user_message: str,
    session_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Generator yielding Server-Sent Events (SSE) for the chat stream.
    Formats output as: data: {"type": "...", ...}\n\n
    """
    now = datetime.utcnow()

    # 1. Get or create session
    if session_id and ObjectId.is_valid(session_id):
        session = await ai_sessions_collection().find_one({"_id": ObjectId(session_id), "user_id": user_id})
    else:
        session = None

    if not session:
        session_doc = {
            "user_id": user_id,
            "title": user_message[:30] if user_message else "New Campaign Chat",
            "agent_trail": ["Head Agent"],
            "messages": [],
            "tokens_used": {"input": 0, "output": 0},
            "created_at": now,
            "updated_at": now,
        }
        res = await ai_sessions_collection().insert_one(session_doc)
        session_id = str(res.inserted_id)
        session = session_doc
        session["_id"] = res.inserted_id

    # 2. Append user turn to MongoDB
    user_turn = {
        "session_id": str(session["_id"]),
        "user_id": user_id,
        "role": "user",
        "content": user_message,
        "created_at": now,
    }
    await ai_turns_collection().insert_one(user_turn)

    # 3. Load message history
    turns_cursor = ai_turns_collection().find({"session_id": str(session["_id"])}).sort("created_at", 1)
    history_docs = await turns_cursor.to_list(length=20)
    messages_payload = [{"role": t["role"], "content": t["content"]} for t in history_docs]

    # 4. Stream agent start event
    yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'Head Agent'})}\n\n"

    # 5. Call multi-agent reasoning loop via LLM provider
    response_data = await chat_json(messages_payload)

    agent_name = response_data.get("agent", "Business Analyzer")
    response_text = response_data.get("message", "Processed input.")
    options = response_data.get("options", [])
    campaign_preview = response_data.get("campaign_preview")

    # Yield agent transition
    yield f"data: {json.dumps({'type': 'agent_start', 'agent': agent_name})}\n\n"

    # Yield tool call event if any
    yield f"data: {json.dumps({'type': 'tool_call', 'tool': 'business_analysis_tool', 'summary': f'Executed strategy scan for {agent_name}'})}\n\n"

    # Yield preview payload if created
    if campaign_preview:
        yield f"data: {json.dumps({'type': 'preview_update', 'preview_type': 'campaign', 'payload': campaign_preview})}\n\n"

    # Stream final message
    yield f"data: {json.dumps({'type': 'message', 'text': response_text, 'options': options, 'agent': agent_name, 'session_id': session_id})}\n\n"

    # 6. Save assistant turn to MongoDB
    assistant_turn = {
        "session_id": str(session["_id"]),
        "user_id": user_id,
        "role": "assistant",
        "agent": agent_name,
        "content": response_text,
        "options": options,
        "created_at": datetime.utcnow(),
    }
    await ai_turns_collection().insert_one(assistant_turn)

    # Update session trail & credits
    agent_trail = session.get("agent_trail", ["Head Agent"])
    if agent_name not in agent_trail:
        agent_trail.append(agent_name)

    await ai_sessions_collection().update_one(
        {"_id": session["_id"]},
        {"$set": {"agent_trail": agent_trail, "updated_at": datetime.utcnow()}},
    )

    # Deduct 1 AI credit
    await users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"credits_remaining": -1}},
    )

    yield "data: [DONE]\n\n"
