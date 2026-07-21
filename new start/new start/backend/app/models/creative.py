"""
LeadPilot — Creative models.
"""
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel


class CopyGenerateRequest(BaseModel):
    product_name: str
    target_audience: str
    goal: str = "Lead Generation"
    framework: Literal["PAS", "AIDA", "DIRECT"] = "PAS"


class ImageGenerateRequest(BaseModel):
    prompt: str
    model_choice: Literal["nano_banana", "gpt_image_1"] = "nano_banana"
    aspect_ratio: str = "1:1"


class CreativeResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: Literal["image", "video", "carousel", "text"]
    source: Literal["ai", "uploaded"]
    url: Optional[str] = None
    headline: Optional[str] = None
    primary_text: Optional[str] = None
    cta: Optional[str] = None
    created_at: datetime
