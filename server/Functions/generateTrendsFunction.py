import json
import os

MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def _parse_json_response(response):
    raw_text = (response.output_text or "").strip()
    if raw_text.startswith("```"):
        parts = raw_text.split("```")
        if len(parts) >= 2:
            raw_text = parts[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()
    return json.loads(raw_text)


def generateNewTrends(client,description):
    system_prompt = f"""
Role: You are a CTO-level Strategic Consultant. 
Core Objective: Identify the 15 most critical skills for our company based on the below description.
description: {description}

RESPONSE FORMAT:
Return a JSON object with a "trends" array containing exactly 15 items. Each item MUST have exactly these three fields:
- metric_name: (string) The name of the skill
- value: (number 1-100) Priority/weight of the skill (100 being highest priority)
- category: (string) Category it belongs to.

Example structure:

{{
  "trends": [
    {{"metric_name": "Agent Orchestration", "value": 95, "category": "Emerging Tech"}},
    {{"metric_name": "Cloud Architecture", "value": 85, "category": "Durable Foundations"}}
  ]
}}
"""
    try:
        response = client.responses.create(
            model=MODEL_NAME,
            input=(
                "Generate a market trends report for our workforce planning system. "
                "Return ONLY valid JSON matching the requested schema. "
                f"Input Data: {json.dumps(system_prompt)}"
            ),
        )

        response = _parse_json_response(response)
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
