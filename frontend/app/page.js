"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import CandidateCard from "./components/CandidateCard";
import StatsBar from "./components/StatsBar";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvFiles, setCvFiles] = useState([]);
  const [threshold, setThreshold] = useState(70);
  const [sendEmails, setSendEmails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setCvFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (index) => {
    setCvFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return setError("Please enter a job description.");
    if (cvFiles.length === 0) return setError("Please upload at least one CV.");
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("threshold", threshold);
      formData.append("send_emails", sendEmails);
      cvFiles.forEach((f) => formData.append("cvs", f));

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await axios.post(`${apiBase}/api/screen-candidates`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setCvFiles([]);
    setJobDescription("");
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #0a0e1a 100%)" }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        backgroundSize: "50px 50px"
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}>
            <span style={{ color: "#00d4ff", fontSize: "12px", fontFamily: "'JetBrains Mono'" }}>
              ◆ POWERED BY GEMINI AI
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800, lineHeight: 1.1, marginBottom: "16px",
            background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            HR Candidate<br />Screening Agent
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
            Upload CVs, define your role, and let Gemini AI rank and screen candidates automatically.
          </p>
        </div>

        {!results ? (
          <div className="space-y-6 fade-up">
            {/* Job Description */}
            <div className="glass-card p-6">
              <label style={{ color: "#00d4ff", fontSize: "12px", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em" }}>
                JOB DESCRIPTION
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste your full job description here — required skills, experience, responsibilities..."
                rows={6}
                style={{
                  width: "100%", marginTop: "12px", padding: "14px",
                  background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "10px", color: "#e2e8f0", fontSize: "14px",
                  resize: "vertical", outline: "none", fontFamily: "inherit"
                }}
              />
            </div>

            {/* CV Upload */}
            <div className="glass-card p-6">
              <label style={{ color: "#00d4ff", fontSize: "12px", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em" }}>
                UPLOAD CVs (PDF)
              </label>
              <div
                {...getRootProps()}
                style={{
                  marginTop: "12px", padding: "40px 20px", borderRadius: "12px", textAlign: "center",
                  cursor: "pointer", transition: "all 0.3s",
                  border: isDragActive ? "2px solid #00d4ff" : "2px dashed rgba(0,212,255,0.3)",
                  background: isDragActive ? "rgba(0,212,255,0.1)" : "rgba(0,212,255,0.03)"
                }}
              >
                <input {...getInputProps()} />
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📂</div>
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                  {isDragActive ? "Drop CVs here..." : "Drag & drop PDF CVs here, or click to browse"}
                </p>
              </div>

              {cvFiles.length > 0 && (
                <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {cvFiles.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px",
                      background: "rgba(0,232,150,0.1)", border: "1px solid rgba(0,232,150,0.3)",
                      borderRadius: "20px", fontSize: "13px"
                    }}>
                      <span style={{ color: "#00e896" }}>📄 {f.name}</span>
                      <button onClick={() => removeFile(i)} style={{ color: "#ff4f6d", cursor: "pointer", background: "none", border: "none", fontSize: "16px" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="glass-card p-6">
              <label style={{ color: "#00d4ff", fontSize: "12px", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em" }}>
                SETTINGS
              </label>
              <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
                    Qualification Threshold: <span style={{ color: "#00d4ff", fontWeight: 700 }}>{threshold}%</span>
                  </p>
                  <input
                    type="range" min={50} max={95} value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    style={{ width: "200px", accentColor: "#00d4ff" }}
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div
                    onClick={() => setSendEmails(!sendEmails)}
                    style={{
                      width: "48px", height: "26px", borderRadius: "13px", position: "relative",
                      background: sendEmails ? "#00d4ff" : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s", cursor: "pointer"
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "3px",
                      left: sendEmails ? "25px" : "3px",
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: "#fff", transition: "left 0.3s"
                    }} />
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                    Auto-send interview invites via Gmail
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div style={{
                padding: "14px 18px", borderRadius: "10px",
                background: "rgba(255,79,109,0.1)", border: "1px solid rgba(255,79,109,0.3)",
                color: "#ff4f6d", fontSize: "14px"
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", padding: "18px", borderRadius: "12px", border: "none",
                background: loading ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00d4ff, #0099cc)",
                color: "#0a0e1a", fontSize: "16px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                transition: "all 0.3s", letterSpacing: "0.05em"
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span className="spin-slow" style={{ display: "inline-block" }}>⚙️</span>
                  Screening {cvFiles.length} candidate{cvFiles.length !== 1 ? "s" : ""}...
                </span>
              ) : (
                `🚀 Screen ${cvFiles.length > 0 ? cvFiles.length : ""} Candidate${cvFiles.length !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        ) : (
          <div className="fade-up">
            <StatsBar results={results} />
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {results.results.map((candidate, i) => (
                <CandidateCard key={i} candidate={candidate} rank={i + 1} threshold={results.threshold} />
              ))}
            </div>
            <button
              onClick={reset}
              style={{
                marginTop: "32px", width: "100%", padding: "16px", borderRadius: "12px",
                background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
                color: "#00d4ff", fontSize: "15px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s"
              }}
            >
              ← Screen New Candidates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
