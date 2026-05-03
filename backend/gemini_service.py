import google.generativeai as genai
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash-latest")  # Use latest flash model


def score_candidate(cv_text: str, job_description: str, filename: str) -> dict:
    """Use Gemini to score a candidate's CV against a job description."""

    cv_text = cv_text[:3000]  # Limit CV text to avoid token limit on free tier
    prompt = f"""
You are an expert HR recruiter. Analyze the following CV against the job description and return a JSON response ONLY.

JOB DESCRIPTION:
{job_description}

CANDIDATE CV:
{cv_text}

Return ONLY a valid JSON object with these exact fields (no markdown, no extra text):
{{
  "name": "candidate full name or 'Unknown' if not found",
  "email": "candidate email or empty string if not found",
  "score": <integer 0-100 based on how well CV matches job>,
  "grade": "A/B/C/D/F",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "summary": "2-3 sentence summary of candidate fit",
  "experience_years": <estimated years of experience as integer>,
  "top_skills": ["skill1", "skill2", "skill3"]
}}
"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Clean up markdown fences if present
        raw = re.sub(r"```json|```", "", raw).strip()

        result = json.loads(raw)
        result["filename"] = filename
        return result

    except json.JSONDecodeError:
        return {
            "filename": filename,
            "name": "Parse Error",
            "email": "",
            "score": 0,
            "grade": "F",
            "strengths": [],
            "weaknesses": ["Could not parse Gemini response"],
            "summary": "Error processing this CV.",
            "experience_years": 0,
            "top_skills": []
        }
    except Exception as e:
        return {
            "filename": filename,
            "name": "Error",
            "email": "",
            "score": 0,
            "grade": "F",
            "strengths": [],
            "weaknesses": [str(e)],
            "summary": f"API error: {str(e)}",
            "experience_years": 0,
            "top_skills": []
        }
