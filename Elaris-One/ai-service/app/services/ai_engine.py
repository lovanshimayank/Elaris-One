import json
import re
import httpx
from ..config import GEMINI_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL

async def check_ollama() -> bool:
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return res.status_code == 200
    except Exception:
        return False

async def generate_with_ollama(prompt: str, system: str = "") -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "system": system, "stream": False}
        )
        return res.json().get("response", "")

async def generate_with_gemini(prompt: str, system: str = "") -> str:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY missing from environment.")

    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = ""

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        body = {
            "contents": [{"parts": [{"text": f"{system}\n\n{prompt}" if system else prompt}]}]
        }
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(url, json=body)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                last_err = res.text
        except Exception as e:
            last_err = str(e)
            continue
    raise RuntimeError(f"Gemini failed: {last_err}")

async def ask_llm(prompt: str, system: str = "") -> str:
    if await check_ollama():
        try:
            return await generate_with_ollama(prompt, system)
        except Exception:
            pass
    return await generate_with_gemini(prompt, system)

def clean_json(text: str) -> str:
    cleaned = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        cleaned = match.group(1).strip()
    return cleaned