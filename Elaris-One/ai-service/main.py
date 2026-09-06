from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import PORT
from app.api.routes import router as ai_router

app = FastAPI(
    title="ELARIS-One AI Microservice",
    description="PyMuPDF Text Extraction, Vector Retrieval, Summarization, Flashcards, and Quizzes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/")
async def root():
    return {"service": "ELARIS-One AI Microservice", "status": "running", "port": PORT}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "FastAPI + PyMuPDF + Multi-LLM"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)