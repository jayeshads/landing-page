"""
LeadPilot — Meta account and asset models.
"""
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class MetaBusinessManager(BaseModel):
    id: str
    name: str


class MetaAdAccount(BaseModel):
    id: str
    name: str
    account_status: int = 1  # 1 = ACTIVE
    currency: str = "INR"


class MetaPage(BaseModel):
    id: str
    name: str
    access_token: Optional[str] = None


class MetaPixel(BaseModel):
    id: str
    name: str


class MetaAssetsResponse(BaseModel):
    businesses: List[MetaBusinessManager] = []
    ad_accounts: List[MetaAdAccount] = []
    pages: List[MetaPage] = []
    pixels: List[MetaPixel] = []


class MetaDiagnosticResult(BaseModel):
    has_bm: bool
    has_ad_account: bool
    has_page: bool
    missing_assets: List[str] = []
    message: str


class MetaConnectRequest(BaseModel):
    bm_id: Optional[str] = None
    ad_account_id: str
    page_id: str
    pixel_id: Optional[str] = None


class MetaStatusResponse(BaseModel):
    status: Literal["not_connected", "connected", "expired"]
    ad_account_id: Optional[str] = None
    page_id: Optional[str] = None
    bm_id: Optional[str] = None
    pixel_id: Optional[str] = None
    connected_at: Optional[datetime] = None
