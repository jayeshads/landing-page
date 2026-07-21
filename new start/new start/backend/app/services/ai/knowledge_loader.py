"""
LeadPilot — Skill Knowledge Loader.

Loads markdown skill files from `backend/skills/` and injects them into
agent system prompts for domain-specific context.
"""
import os
from typing import Dict, List

SKILLS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "skills")


def load_skill(skill_filename: str) -> str:
    """Read a .md skill file from the skills directory."""
    path = os.path.join(SKILLS_DIR, skill_filename)
    if not os.path.exists(path):
        return ""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception as e:
        print(f"Error loading skill file {skill_filename}: {e}")
        return ""


def load_all_skills() -> Dict[str, str]:
    """Load all .md skill files in the skills directory into a dict."""
    skills = {}
    if not os.path.exists(SKILLS_DIR):
        return skills

    for filename in os.listdir(SKILLS_DIR):
        if filename.endswith(".md"):
            skills[filename] = load_skill(filename)

    return skills


def get_agent_skill_context(agent_name: str) -> str:
    """Return relevant skill file content based on agent name."""
    mapping = {
        "campaign_creator": "meta_campaign_best_practices.md",
        "copy_writer": "copywriting_frameworks.md",
        "audience_creator": "indian_d2c_audience_targeting.md",
    }

    filename = mapping.get(agent_name)
    if filename:
        content = load_skill(filename)
        if content:
            return f"\n--- INJECTED SKILL KNOWLEDGE ({filename}) ---\n{content}\n----------------------------------------\n"

    return ""
