import os
from dotenv import load_dotenv

load_dotenv()
if not os.getenv("GEMINI_API_KEY") and os.path.exists("../backend/.env"):
    load_dotenv("../backend/.env")

PORT = int(os.getenv("AI_SERVICE_PORT", "8000"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")