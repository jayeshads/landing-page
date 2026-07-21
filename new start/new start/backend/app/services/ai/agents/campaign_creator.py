"""
LeadPilot — Campaign Structure Creator Agent.
"""
from app.services.ai.agents.base_agent import BaseAgent


class CampaignCreator(BaseAgent):
    name = "Campaign Structure Creator"
    model_provider = "openai"
    instructions = """
    You are Campaign Structure Creator. Generate full campaign hierarchy: name, objective
    (LEADS/SALES/TRAFFIC), daily budget, conversion location, and placements.
    """
