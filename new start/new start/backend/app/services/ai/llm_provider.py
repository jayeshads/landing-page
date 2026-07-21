"""
LeadPilot — Unified LLM Multi-Provider Service.

Supports OpenAI, Anthropic Claude, and Google Gemini with graceful fallback.
"""
import json
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings


async def chat_json(
    messages: List[Dict[str, str]],
    system: str = "",
    model_provider: str = "auto",
) -> Dict[str, Any]:
    """
    Call an LLM provider and guarantee a JSON dictionary output.
    """
    # 1. OpenAI if configured
    if (model_provider == "openai" or model_provider == "auto") and settings.OPENAI_API_KEY:
        try:
            return await _call_openai(messages, system)
        except Exception as e:
            print(f"OpenAI call failed, falling back: {e}")

    # 2. Anthropic if configured
    if (model_provider == "claude" or model_provider == "auto") and settings.ANTHROPIC_API_KEY:
        try:
            return await _call_anthropic(messages, system)
        except Exception as e:
            print(f"Anthropic call failed, falling back: {e}")

    # 3. Google Gemini if configured
    if (model_provider == "gemini" or model_provider == "auto") and settings.GOOGLE_API_KEY:
        try:
            return await _call_gemini(messages, system)
        except Exception as e:
            print(f"Gemini call failed: {e}")

    # Development Fallback / Mock Reasoning Engine if no API keys configured
    return _mock_llm_response(messages)


async def _call_openai(messages: List[Dict[str, str]], system: str) -> Dict[str, Any]:
    formatted_messages = []
    if system:
        formatted_messages.append({"role": "system", "content": system})
    formatted_messages.extend(messages)

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o",
                "response_format": {"type": "json_object"},
                "messages": formatted_messages,
                "temperature": 0.7,
            },
            timeout=30.0,
        )

        if res.status_code != 200:
            raise RuntimeError(f"OpenAI API Error: {res.text}")

        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content)


async def _call_anthropic(messages: List[Dict[str, str]], system: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": "claude-3-5-sonnet-20240620",
                "system": system + "\nRespond strictly in valid JSON.",
                "messages": messages,
                "max_tokens": 1500,
            },
            timeout=30.0,
        )

        if res.status_code != 200:
            raise RuntimeError(f"Anthropic API Error: {res.text}")

        content = res.json()["content"][0]["text"]
        return json.loads(content)


async def _call_gemini(messages: List[Dict[str, str]], system: str) -> Dict[str, Any]:
    # Basic Gemini REST call format
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GOOGLE_API_KEY}"
    prompt = f"{system}\n\n" + "\n".join([f"{m['role']}: {m['content']}" for m in messages]) + "\n\nRespond only with valid JSON."

    async with httpx.AsyncClient() as client:
        res = await client.post(
            url,
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30.0,
        )

        if res.status_code != 200:
            raise RuntimeError(f"Gemini API Error: {res.text}")

        raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        # Clean markdown code blocks if any
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_text)


def _mock_llm_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """Mock smart agent decision loop for local dev when no LLM API keys are configured."""
    last_msg = messages[-1]["content"].lower() if messages else ""

    if "budget" in last_msg or "₹" in last_msg or "day" in last_msg:
        return {
            "agent": "Campaign Structure Creator",
            "action": "build_campaign",
            "message": "Daily budget set! Now building audience targeting matrix and ad creatives...",
            "options": ["Proceed to Ad Creatives", "Change Targeting", "Edit Budget"],
            "campaign_preview": {
                "name": "Handmade Candles — High Conversion Lead Gen",
                "objective": "OUTCOME_LEADS",
                "budget": "₹500 / day",
                "placements": ["FB Feed", "IG Feed", "IG Stories"],
            },
            "ad_preview": {
                "headline": "Get 20% OFF Organic Soy Candles",
                "primary_text": "Transform your home ambiance with 100% organic soy wax scented candles. Special discount today!",
                "cta": "Shop Now",
            },
        }

    return {
        "agent": "Business Analyzer",
        "action": "ask_user",
        "message": "Maine aapke business details receive kar liye hain. Main aapke liye ek high-converting Meta Ads structure setup kar raha hoon. Aapka daily ad budget kitna hoga?",
        "options": ["₹500 / day", "₹1,000 / day", "₹2,500 / day", "Custom Budget"],
    }
