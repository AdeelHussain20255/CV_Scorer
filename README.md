# 🤖 HR Candidate Screening Agent
**Agentic AI Hackathon KHI — Project 2**

AI-powered HR screening tool using **Gemini AI + FastAPI + Next.js**

---

## 🚀 Features
- Upload multiple CVs (PDF) and a job description
- Gemini AI scores & ranks each candidate (0–100)
- Auto-send interview invite emails via Gmail to qualified candidates
- Beautiful dashboard with grades, strengths, weaknesses, skills

---

## 📁 Project Structure
```
hr-screening-agent/
├── backend/          ← FastAPI + Gemini + Gmail
│   ├── main.py
│   ├── gemini_service.py
│   ├── cv_parser.py
│   ├── email_service.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         ← Next.js dashboard
    └── app/
```

---

## ⚙️ Setup

### Step 1 — Get FREE Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key** (free, no credit card)
3. Copy the key

### Step 2 — Gmail App Password
1. Enable 2-Step Verification on your Google account
2. Go to: Google Account → Security → App Passwords
3. Create a new app password (select "Mail")
4. Copy the 16-character password

### Step 3 — Backend Setup
```bash
cd backend

# Copy env file
cp .env.example .env

# Fill in your keys in .env:
# GEMINI_API_KEY=your_key
# GMAIL_USER=your@gmail.com
# GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
# COMPANY_NAME=Your Company

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py
# → Runs on http://localhost:8000
```

### Step 4 — Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
# → Runs on http://localhost:3000
```

---

## 🎯 How to Use
1. Open http://localhost:3000
2. Paste a job description
3. Upload PDF CVs (drag & drop)
4. Set qualification threshold (default: 70%)
5. Toggle email sending on/off
6. Click **Screen Candidates**
7. View ranked results — qualified candidates get auto-emailed!

---

## 🛠️ Tech Stack (from Saylani Course Outline)
| Layer | Technology |
|-------|-----------|
| LLM | Google Gemini 1.5 Flash (FREE) |
| Backend | FastAPI + Python |
| Frontend | Next.js + Tailwind CSS |
| PDF Parsing | PyMuPDF |
| Email | Gmail SMTP (FREE) |

---

## 💡 Tips
- Gemini 1.5 Flash has a generous free tier (1500 requests/day)
- Make sure CVs have selectable text (not scanned images)
- The agent extracts emails from CVs automatically for sending invites
