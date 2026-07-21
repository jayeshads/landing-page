"""
LeadPilot — Campaign data models.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class BudgetConfig(BaseModel):
    type: Literal["daily", "lifetime"] = "daily"
    amount: float = 500.0


class AdSetAudience(BaseModel):
    name: str = "Broad Audience"
    locations: List[str] = ["India"]
    age_min: int = 21
    age_max: int = 50
    interests: List[str] = []


class AdConfig(BaseModel):
    headline: str
    primary_text: str
    cta: str = "Shop Now"
    image_url: Optional[str] = None


class AdSet(BaseModel):
    name: str
    audience: AdSetAudience
    ads: List[AdConfig] = []


class MetricsCache(BaseModel):
    spend: float = 0.0
    leads: int = 0
    cpl: float = 0.0
    cpc: float = 0.0
    roas: float = 0.0
    impressions: int = 0
    last_synced: Optional[datetime] = None


class CampaignCreate(BaseModel):
    name: str
    objective: Literal["OUTCOME_LEADS", "OUTCOME_SALES", "OUTCOME_TRAFFIC"] = "OUTCOME_LEADS"
    budget: BudgetConfig = Field(default_factory=BudgetConfig)
    placements: List[str] = ["facebook_feed", "instagram_feed", "instagram_stories"]
    adsets: List[AdSet] = []
    landing_page_id: Optional[str] = None


class CampaignResponse(BaseModel):
    id: str
    user_id: str
    meta_campaign_id: Optional[str] = None
    name: str
    objective: str
    status: Literal["draft", "in_review", "active", "paused"]
    budget: BudgetConfig
    placements: List[str]
    adsets: List[AdSet]
    metrics_cache: MetricsCache
    has_recommendation: bool = False
    created_at: datetime
    updated_at: datetime
