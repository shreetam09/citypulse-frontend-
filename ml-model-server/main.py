"""
CityPulse Machine Learning Model Microservice API Server (FastAPI)
Listens on http://localhost:8000
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from model_inference import vision_model

app = FastAPI(
    title="CityPulse Machine Learning Vision API",
    description="YOLOv8 & PyTorch Computer Vision Model Endpoint for Municipal Civic Issue Detection",
    version="2.0.0"
)

# Enable CORS for Spring Boot & Express Frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    imageUrl: Optional[str] = None
    description: Optional[str] = None
    categoryHint: Optional[str] = None

class PredictResponse(BaseModel):
    category: str
    confidence: float
    severity: float
    severityLabel: str
    modelVersion: str
    detectedFeatures: List[str]
    boundingBoxes: List[dict]

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "CityPulse Machine Learning Computer Vision Model Server",
        "version": "2.0.0",
        "docs": "http://localhost:8000/docs"
    }

@app.get("/ml/v1/health")
def health_check():
    return {
        "status": "UP",
        "model": vision_model.model_name,
        "classes": vision_model.classes,
        "hardware": "CPU/GPU Inference Accelerator"
    }

@app.post("/ml/v1/predict", response_model=PredictResponse)
def predict_image(request: PredictRequest):
    """
    Predict civic issue category, severity, and hazard features from image URL.
    """
    result = vision_model.predict(
        image_url=request.imageUrl,
        user_category_hint=request.categoryHint
    )
    return result

@app.post("/ml/v1/predict-file", response_model=PredictResponse)
async def predict_image_file(
    file: UploadFile = File(...),
    categoryHint: Optional[str] = Form(None)
):
    """
    Predict civic issue category, severity, and hazard features from uploaded multipart file.
    """
    contents = await file.read()
    result = vision_model.predict(
        image_bytes=contents,
        user_category_hint=categoryHint
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
