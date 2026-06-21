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

def evaluateEmployee(client, employee_data, company_consts):

    # 3. Merge into a single payload for the model
    # This linking ensures the AI compares specific fields directly
    context = {
        "candidate": employee_data,
        "company_needs": company_consts
    }

    try:
        response = client.responses.create(
            model=MODEL_NAME,
            input=(
                "Analyze the candidate against the company needs. Return ONLY a valid JSON object with exactly two fields: "
                "\"score\" (integer 0-100 representing the match percentage) and "
                "\"review\" (string with analysis of strengths, weaknesses, and improvements needed). "
                f"Input Data: {json.dumps(context)}"
            ),
        )

        evaluation = _parse_json_response(response)
        return evaluation

    except Exception as e:
        print(f"An error occurred during API call: {e}")
