"""
LeadPilot — AI Chat Router (SSE Streaming & History CRUD).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from bson import ObjectId

from app.auth.dependencies import get_current_user
from app.db.mongodb import ai_sessions_collection, ai_turns_collection
from app.services.ai.orchestrator import run_multi_agent_turn_stream

router = APIRouter(prefix="/ai", tags=["ai_chat"])


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


@router.post("/chat/stream")
async def chat_stream(
    body: ChatMessageRequest,
    user: dict = Depends(get_current_user),
):
    """
    SSE Streaming endpoint for real-time multi-agent chat response.
    Returns event stream chunks (`data: {"type": ...}\n\n`).
    """
    user_id = str(user["_id"])
    return StreamingResponse(
        run_multi_agent_turn_stream(user_id, body.message, body.session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/sessions")
async def list_ai_sessions(user: dict = Depends(get_current_user)):
    """Fetch user's chat sessions."""
    user_id = str(user["_id"])
    cursor = ai_sessions_collection().find({"user_id": user_id}).sort("updated_at", -1)
    sessions = await cursor.to_list(length=50)

    return [
        {
            "id": str(s["_id"]),
            "title": s.get("title", "Untitled Chat"),
            "agent_trail": s.get("agent_trail", ["Head Agent"]),
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
async def get_session_history(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Fetch all messages/turns for a specific chat session."""
    user_id = str(user["_id"])
    session = await ai_sessions_collection().find_one({"_id": ObjectId(session_id), "user_id": user_id})

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    cursor = ai_turns_collection().find({"session_id": session_id}).sort("created_at", 1)
    turns = await cursor.to_list(length=100)

    return {
        "session_id": session_id,
        "title": session.get("title"),
        "agent_trail": session.get("agent_trail", []),
        "turns": [
            {
                "id": str(t["_id"]),
                "role": t["role"],
                "agent": t.get("agent"),
                "content": t["content"],
                "options": t.get("options", []),
                "created_at": t.get("created_at"),
            }
            for t in turns
        ],
    }
