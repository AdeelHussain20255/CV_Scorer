from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
from cv_parser import extract_text_from_pdf
from gemini_service import score_candidate
from email_service import send_interview_invite
import json

app = FastAPI(title="HR Candidate Screening Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "HR Screening Agent API is running!"}

@app.post("/screen-candidates")
async def screen_candidates(
    job_description: str = Form(...),
    threshold: int = Form(70),
    send_emails: bool = Form(True),
    cvs: List[UploadFile] = File(...)
):
    if not cvs:
        raise HTTPException(status_code=400, detail="No CV files uploaded")

    results = []

    for cv_file in cvs:
        # Read and parse CV
        content = await cv_file.read()
        cv_text = extract_text_from_pdf(content, cv_file.filename)

        if not cv_text:
            results.append({
                "filename": cv_file.filename,
                "error": "Could not extract text from this file",
                "score": 0
            })
            continue

        # Score with Gemini
        scoring_result = score_candidate(cv_text, job_description, cv_file.filename)

        # Auto-send email if qualified
        email_sent = False
        if send_emails and scoring_result.get("score", 0) >= threshold:
            candidate_email = scoring_result.get("email", "")
            candidate_name = scoring_result.get("name", "Candidate")
            if candidate_email:
                email_sent = send_interview_invite(candidate_email, candidate_name)

        scoring_result["email_sent"] = email_sent
        scoring_result["qualified"] = scoring_result.get("score", 0) >= threshold
        results.append(scoring_result)

    # Sort by score descending
    results.sort(key=lambda x: x.get("score", 0), reverse=True)

    return {
        "total": len(results),
        "qualified": sum(1 for r in results if r.get("qualified", False)),
        "threshold": threshold,
        "results": results
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
