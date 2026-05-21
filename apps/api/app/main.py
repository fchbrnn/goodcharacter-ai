from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
import base64
import os
import json
import random
from datetime import datetime

# Konfigurasi Worker AI
WORKER_AI_URL = os.getenv("WORKER_AI_URL", "https://flux-worker.fachrulfebriana.workers.dev")
WORKER_AI_ENABLED = bool(WORKER_AI_URL)

app = FastAPI(
    title="GoodCharacter.ai API",
    description="Backend API for AI Image & Video Generation",
    version="1.0.0"
)

# CORS - izinkan frontend lokal dan production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://goodcharacter-ai.vercel.app",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Request/Response Models ============
class GenerateImageRequest(BaseModel):
    prompt: str = Field(..., description="Deskripsi gambar", min_length=1, max_length=1000)
    negative_prompt: Optional[str] = Field(
        "low quality, blurry, deformed, ugly, bad anatomy, watermark, text, signature",
        description="Hal yang tidak ingin muncul"
    )
    width: int = Field(1024, ge=256, le=1024, description="Lebar gambar (256-1024)")
    height: int = Field(1024, ge=256, le=1024, description="Tinggi gambar (256-1024)")
    steps: int = Field(35, ge=10, le=50, description="Jumlah langkah denoising (semakin tinggi semakin detail)")
    guidance: float = Field(7.5, ge=1.0, le=20.0, description="Seberapa kuat prompt diikuti")
    seed: Optional[int] = Field(None, description="Random seed untuk reproduksi")
    style_preset: Optional[str] = Field("photographic", description="Gaya visual")
    num_images: int = Field(1, ge=1, le=4, description="Jumlah gambar (SDXL hanya support 1 untuk API ini)")
    style: Optional[str] = Field("realistic", description="Gaya (realistic, anime, cartoon, 3d)")

class GenerateImageResponse(BaseModel):
    success: bool
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    message: str
    params_used: Optional[dict] = None
    error: Optional[str] = None

# ============ Helper ============
def style_preset_mapping(style: str) -> str:
    """Mapping gaya frontend ke style_preset SDXL"""
    mapping = {
        "realistic": "photographic",
        "anime": "anime",
        "cartoon": "digital-art",
        "3d": "3d-model"
    }
    return mapping.get(style, "photographic")

# ============ Endpoints ============
@app.get("/")
async def root():
    return {
        "name": "GoodCharacter.ai API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "worker_ai_available": WORKER_AI_ENABLED,
        "worker_ai_url": WORKER_AI_URL
    }

@app.post("/api/generate", response_model=GenerateImageResponse)
async def generate_image(request: GenerateImageRequest):
    try:
        # Gunakan style_preset dari request jika ada, atau mapping dari style
        style_preset = request.style_preset or style_preset_mapping(request.style or "realistic")
        
        # Generate random seed jika tidak disediakan
        seed = request.seed if request.seed is not None else random.randint(1, 1000000)
        
        # Siapkan payload untuk Worker AI
        payload = {
            "prompt": request.prompt,
            "negative_prompt": request.negative_prompt,
            "width": request.width,
            "height": request.height,
            "steps": request.steps,
            "guidance": request.guidance,
            "seed": seed,
            "style_preset": style_preset
        }
        
        # Kirim request ke Worker AI
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                WORKER_AI_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                error_detail = response.text[:200]
                return GenerateImageResponse(
                    success=False,
                    message="Gagal generate gambar",
                    error=f"Worker AI error (HTTP {response.status_code}): {error_detail}"
                )
            
            # Konversi binary image ke base64 untuk dikirim ke frontend
            image_base64 = base64.b64encode(response.content).decode('utf-8')
            
            return GenerateImageResponse(
                success=True,
                image_base64=image_base64,
                message="Gambar berhasil di-generate!",
                params_used={
                    "prompt": request.prompt[:100] + ("..." if len(request.prompt) > 100 else ""),
                    "steps": request.steps,
                    "guidance": request.guidance,
                    "style": style_preset,
                    "resolution": f"{request.width}x{request.height}"
                }
            )
            
    except httpx.TimeoutException:
        return GenerateImageResponse(
            success=False,
            message="Request timeout",
            error="Worker AI tidak merespon dalam waktu yang ditentukan. Coba lagi nanti."
        )
    except Exception as e:
        return GenerateImageResponse(
            success=False,
            message="Terjadi kesalahan",
            error=str(e)
        )

# ============ Endpoint untuk video (placeholder) ============
class GenerateVideoRequest(BaseModel):
    character_image_url: str
    product_image_url: str
    prompt: str
    duration: int = 15
    voice_text: Optional[str] = None

@app.post("/api/generate-video")
async def generate_video(request: GenerateVideoRequest):
    # TODO: Implementasi generate video dengan Mochi 1 atau alternatif
    return {
        "success": False,
        "message": "Fitur video masih dalam pengembangan",
        "video_url": None
    }