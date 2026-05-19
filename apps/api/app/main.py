from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="GoodCharacter.ai API",
    description="Backend API for AI Image & Video Generation",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://goodcharacter.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "GoodCharacter.ai API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": "2026-01-01T00:00:00Z"}
