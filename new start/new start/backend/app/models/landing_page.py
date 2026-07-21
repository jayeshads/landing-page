"""
LeadPilot — Landing page models.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class TemplateResponse(BaseModel):
    id: str
    name: str
    conversion_goal: str
    thumbnail: str
    html_content: str


class LandingPageCreate(BaseModel):
    template_id: str
    title: str
    campaign_id: Optional[str] = None
    custom_slug: Optional[str] = None


class LandingPageUpdateHTML(BaseModel):
    html_content: str


class LandingPageResponse(BaseModel):
    id: str
    user_id: str
    template_id: str
    title: str
    hosted_slug: str
    hosted_url: str
    status: Literal["draft", "live", "paused"]
    views: int = 0
    submissions: int = 0
    created_at: datetime
    updated_at: datetime
