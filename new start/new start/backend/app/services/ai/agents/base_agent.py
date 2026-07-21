"""
LeadPilot — Base AI Agent Class.
"""
from typing import Dict, Any, List
from app.services.ai.knowledge_loader import get_agent_skill_context
from app.services.ai.llm_provider import chat_json


class BaseAgent:
    name: str = "Base Agent"
    model_provider: str = "auto"
    instructions: str = ""

    def __init__(self):
        self.skill_context = get_agent_skill_context(self.name.lower().replace(" ", "_"))

    def build_system_prompt(self) -> str:
        prompt = f"You are {self.name}, a specialized AI agent in the LeadPilot Meta Ads platform.\n"
        prompt += self.instructions
        if self.skill_context:
            prompt += self.skill_context
        prompt += "\nAlways respond with ONLY valid JSON."
        return prompt

    async def run(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        system = self.build_system_prompt()
        return await chat_json(messages, system=system, model_provider=self.model_provider)
