# ✅ Purpose: Main FastAPI server for AI analysis

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentiment import analyze_sentiment, detect_fake_content
import nltk
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

# Download required NLTK data on startup
try:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('brown', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt_tab', quiet=True)
except:
    pass

app = FastAPI(
    title="Public Voice AI Service",
    description="AI-powered sentiment analysis and fake content detection",
    version="1.0.0"
)

# Allow requests from Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# 📝 REQUEST MODELS
# ─────────────────────────────────────────

class IssueAnalysisRequest(BaseModel):
    title: str
    description: str

class AnalysisResponse(BaseModel):
    sentiment: str
    polarity: float
    is_urgent: bool
    is_fake: bool
    fake_score: int
    urgent_keywords_found: list
    reasons: list
    subjectivity: float

# ─────────────────────────────────────────
# 🏥 HEALTH CHECK
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "success": True,
        "message": "🤖 Public Voice AI Service is running!",
        "version": "1.0.0"
    }

# ─────────────────────────────────────────
# 🔍 ANALYZE ISSUE
# POST /ai/analyze
# ─────────────────────────────────────────

@app.post("/ai/analyze")
def analyze_issue(request: IssueAnalysisRequest):
    """
    Analyze an issue for sentiment and fake content
    Called by Node.js backend after issue creation
    """
    try:
        # Validate input
        if not request.title or not request.description:
            raise HTTPException(
                status_code=400,
                detail="Title and description are required"
            )

        # Run sentiment analysis
        sentiment_result = analyze_sentiment(
            request.title,
            request.description
        )

        # Run fake content detection
        fake_result = detect_fake_content(
            request.title,
            request.description
        )

        # Combine results
        result = {
            "success": True,
            "sentiment": sentiment_result["sentiment"],
            "polarity": sentiment_result["polarity"],
            "is_urgent": sentiment_result["is_urgent"],
            "subjectivity": sentiment_result["subjectivity"],
            "urgent_keywords_found": sentiment_result["urgent_keywords_found"],
            "is_fake": fake_result["is_fake"],
            "fake_score": fake_result["fake_score"],
            "reasons": fake_result["reasons"],
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 📊 BATCH ANALYZE MULTIPLE ISSUES
# POST /ai/analyze-batch
# ─────────────────────────────────────────

@app.post("/ai/analyze-batch")
def analyze_batch(issues: list[IssueAnalysisRequest]):
    """Analyze multiple issues at once"""
    results = []
    for issue in issues:
        sentiment_result = analyze_sentiment(issue.title, issue.description)
        fake_result = detect_fake_content(issue.title, issue.description)
        results.append({
            "title": issue.title,
            "sentiment": sentiment_result["sentiment"],
            "is_urgent": sentiment_result["is_urgent"],
            "is_fake": fake_result["is_fake"],
        })
    return {"success": True, "results": results}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)