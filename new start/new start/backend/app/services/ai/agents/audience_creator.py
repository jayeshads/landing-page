"""
LeadPilot — Audience Creator Agent.
"""
from app.services.ai.agents.base_agent import BaseAgent


class AudienceCreator(BaseAgent):
    name = "Audience Creator"
    model_provider = "gemini"
    instructions = """
    You are Audience Creator. Fast demographic, interest, location, and lookalike targeting generator.
    """
