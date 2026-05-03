from http.server import BaseHTTPRequestHandler
import json
import os
import re
import io
import email as email_lib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import cgi

# ── Gemini ────────────────────────────────────────────────────────────────────
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
model = genai.GenerativeModel("gemini-1.5-flash-latest")


def score_candidate(cv_text: str, job_description: str, filename: str) -> dict:
    cv_text = cv_text[:3000]
    prompt = f"""You are an expert HR recruiter. Analyze the following CV against the job description and return a JSON response ONLY.

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
}}"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json|```", "", raw).strip()
        result = json.loads(raw)
        result["filename"] = filename
        return result
    except json.JSONDecodeError:
        return {
            "filename": filename, "name": "Parse Error", "email": "", "score": 0,
            "grade": "F", "strengths": [], "weaknesses": ["Could not parse Gemini response"],
            "summary": "Error processing this CV.", "experience_years": 0, "top_skills": []
        }
    except Exception as e:
        return {
            "filename": filename, "name": "Error", "email": "", "score": 0,
            "grade": "F", "strengths": [], "weaknesses": [str(e)],
            "summary": f"API error: {str(e)}", "experience_years": 0, "top_skills": []
        }


# ── PDF Parser ────────────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes, filename: str = "") -> str:
    try:
        import fitz
        pdf_stream = io.BytesIO(file_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error parsing {filename}: {e}")
        return ""


# ── Email Service ─────────────────────────────────────────────────────────────
GMAIL_USER = os.environ.get("GMAIL_USER", "")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
COMPANY_NAME = os.environ.get("COMPANY_NAME", "Our Company")


def send_interview_invite(to_email: str, candidate_name: str) -> bool:
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        return False
    subject = f"Interview Invitation - {COMPANY_NAME}"
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;border-radius:10px;text-align:center;">
            <h1 style="color:#00d4ff;margin:0;">🎉 Congratulations!</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9;border-radius:0 0 10px 10px;">
            <p style="font-size:16px;">Dear <strong>{candidate_name}</strong>,</p>
            <p style="font-size:15px;color:#333;">
                We have reviewed your application and are pleased to inform you that you have been
                <strong style="color:#28a745;">shortlisted</strong> for an interview at <strong>{COMPANY_NAME}</strong>.
            </p>
            <p style="font-size:15px;color:#333;">Our HR team will reach out shortly to schedule a convenient interview time.</p>
            <div style="background:#fff;border-left:4px solid #00d4ff;padding:15px;margin:20px 0;border-radius:4px;">
                <p style="margin:0;color:#555;">📅 Please keep an eye on your email for further details regarding the interview schedule.</p>
            </div>
            <p style="font-size:14px;color:#888;margin-top:30px;">
                Best regards,<br><strong>HR Team</strong><br>{COMPANY_NAME}
            </p>
        </div>
    </body></html>"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = GMAIL_USER
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False


# ── Vercel Handler ────────────────────────────────────────────────────────────
class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"message": "HR Screening Agent API is running!"}).encode())

    def do_POST(self):
        content_type = self.headers.get("Content-Type", "")
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        # Parse multipart form data
        environ = {
            "REQUEST_METHOD": "POST",
            "CONTENT_TYPE": content_type,
            "CONTENT_LENGTH": str(content_length),
        }

        try:
            fs = cgi.FieldStorage(
                fp=io.BytesIO(body),
                headers=self.headers,
                environ=environ
            )

            job_description = fs.getvalue("job_description", "")
            threshold = int(fs.getvalue("threshold", "70") or "70")
            send_emails_val = fs.getvalue("send_emails", "true")
            send_emails = send_emails_val.lower() not in ("false", "0", "no")

            # Collect CV files
            cv_files = fs["cvs"] if "cvs" in fs else []
            if not isinstance(cv_files, list):
                cv_files = [cv_files]

            if not cv_files or (len(cv_files) == 1 and not cv_files[0].filename):
                self._respond(400, {"error": "No CV files uploaded"})
                return

            results = []
            for cv_item in cv_files:
                file_bytes = cv_item.file.read()
                filename = cv_item.filename or "upload.pdf"
                cv_text = extract_text_from_pdf(file_bytes, filename)

                if not cv_text:
                    results.append({"filename": filename, "error": "Could not extract text", "score": 0})
                    continue

                scoring_result = score_candidate(cv_text, job_description, filename)

                email_sent = False
                if send_emails and scoring_result.get("score", 0) >= threshold:
                    candidate_email = scoring_result.get("email", "")
                    candidate_name = scoring_result.get("name", "Candidate")
                    if candidate_email:
                        email_sent = send_interview_invite(candidate_email, candidate_name)

                scoring_result["email_sent"] = email_sent
                scoring_result["qualified"] = scoring_result.get("score", 0) >= threshold
                results.append(scoring_result)

            results.sort(key=lambda x: x.get("score", 0), reverse=True)

            self._respond(200, {
                "total": len(results),
                "qualified": sum(1 for r in results if r.get("qualified", False)),
                "threshold": threshold,
                "results": results
            })

        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _respond(self, status: int, data: dict):
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
