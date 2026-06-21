import os
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
import flask
from flask_cors import CORS
from routes.EmployeeEvaluation import EmployeeEvaluation
from routes.GenerateTrends import GenerateTrends

app = flask.Flask(__name__)
CORS(app)


load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Render/Linux env vars are case-sensitive, so support both common variants.
groq_api_key = (
    os.getenv("GROQ_API_KEY")
)

if not groq_api_key:
    raise RuntimeError(
        "Missing Groq API key. Set GROQ_API_KEY in your environment or Render dashboard."
    )

# Initialize the Groq OpenAI-compatible client using the key from .env
client = OpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

# Initialize Supabase client
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
supabase_key = supabase_service_key or os.getenv("VITE_SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)
app.config["SUPABASE_HAS_SERVICE_ROLE"] = bool(supabase_service_key)


EmployeeEvaluation(app,client,supabase)
GenerateTrends(app,client,supabase)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

