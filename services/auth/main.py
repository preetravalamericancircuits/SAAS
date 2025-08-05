from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime
import uvicorn

app = FastAPI(
    title="Auth Service",
    description="Authentication service with health endpoints",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Auth Service is running"}

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/health/detailed")
async def health_check_detailed():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "auth-service",
        "version": "1.0.0",
        "checks": {
            "service": {"status": "healthy"},
            "dependencies": {"status": "healthy"}
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
