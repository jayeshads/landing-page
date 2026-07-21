"""
LeadPilot — Business Analyzer Agent.
"""
from app.services.ai.agents.base_agent import BaseAgent


class BusinessAnalyzer(BaseAgent):
    name = "Business Analyzer"
    model_provider = "claude"
    instructions = """
    You are Business Analyzer. Deep dive into the user's business model, customer avatar,
    value proposition, and goals. Ask questions one-by-one Emergent style.
    """
