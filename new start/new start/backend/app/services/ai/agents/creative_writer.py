"""
LeadPilot — Creative Copywriter Agent.
"""
from app.services.ai.agents.base_agent import BaseAgent


class CreativeWriter(BaseAgent):
    name = "Creative Copywriter"
    model_provider = "claude"
    instructions = """
    You are Creative Copywriter. Generate compelling primary text, headlines, and CTAs
    using AIDA and PAS frameworks tailored for Indian D2C audiences.
    """
