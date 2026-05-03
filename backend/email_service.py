import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")  # Use Gmail App Password, NOT your real password
COMPANY_NAME = os.getenv("COMPANY_NAME", "Our Company")


def send_interview_invite(to_email: str, candidate_name: str) -> bool:
    """Send an interview invitation email to a qualified candidate."""

    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("Gmail credentials not set in .env file")
        return False

    subject = f"Interview Invitation - {COMPANY_NAME}"

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #00d4ff; margin: 0;">🎉 Congratulations!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Dear <strong>{candidate_name}</strong>,</p>
            <p style="font-size: 15px; color: #333;">
                We have reviewed your application and are pleased to inform you that you have been 
                <strong style="color: #28a745;">shortlisted</strong> for an interview at <strong>{COMPANY_NAME}</strong>.
            </p>
            <p style="font-size: 15px; color: #333;">
                Our HR team will reach out to you shortly to schedule a convenient time for the interview.
            </p>
            <div style="background: #fff; border-left: 4px solid #00d4ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #555;">
                    📅 Please keep an eye on your email for further details regarding the interview schedule, format, and any preparation materials.
                </p>
            </div>
            <p style="font-size: 15px; color: #333;">
                We look forward to speaking with you!
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
                Best regards,<br>
                <strong>HR Team</strong><br>
                {COMPANY_NAME}
            </p>
        </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = GMAIL_USER
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())

        print(f"✅ Interview invite sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False
