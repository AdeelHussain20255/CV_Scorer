"use client";
import { useState } from "react";

const gradeColor = { A: "#00e896", B: "#00d4ff", C: "#ffd166", D: "#ff8c42", F: "#ff4f6d" };

export default function CandidateCard({ candidate, rank, threshold }) {
  const [expanded, setExpanded] = useState(false);
  const score = candidate.score || 0;
  const qualified = score >= threshold;
  const grade = candidate.grade || "F";
  const color = gradeColor[grade] || "#94a3b8";

  return (
    <div className="glass-card" style={{
      padding: "24px", transition: "all 0.3s",
      borderColor: qualified ? "rgba(0,232,150,0.3)" : "rgba(255,79,109,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Rank */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: rank <= 3 ? "linear-gradient(135deg, #ffd166, #ff8c42)" : "rgba(255,255,255,0.05)",
          fontWeight: 800, fontSize: "16px", color: rank <= 3 ? "#0a0e1a" : "#64748b",
          fontFamily: "'Syne'"
        }}>
          #{rank}
        </div>

        {/* Name & file */}
        <div style={{ flex: 1, minWidth: "140px" }}>
          <h3 style={{ fontWeight: 700, fontSize: "16px", color: "#f1f5f9", marginBottom: "2px" }}>
            {candidate.name || "Unknown"}
          </h3>
          <p style={{ color: "#475569", fontSize: "12px", fontFamily: "'JetBrains Mono'" }}>
            {candidate.filename}
          </p>
        </div>

        {/* Score bar */}
        <div style={{ minWidth: "160px", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Match Score</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color }}>
              {score}%
            </span>
          </div>
          <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${score}%`, borderRadius: "4px",
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              transition: "width 1s ease"
            }} />
          </div>
        </div>

        {/* Grade badge */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "10px", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: `${color}20`, border: `2px solid ${color}`,
          fontFamily: "'Syne'", fontWeight: 800, fontSize: "20px", color
        }}>
          {grade}
        </div>

        {/* Status */}
        <div style={{
          padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
          background: qualified ? "rgba(0,232,150,0.15)" : "rgba(255,79,109,0.15)",
          border: `1px solid ${qualified ? "rgba(0,232,150,0.4)" : "rgba(255,79,109,0.4)"}`,
          color: qualified ? "#00e896" : "#ff4f6d"
        }}>
          {qualified ? "✓ Qualified" : "✗ Rejected"}
          {candidate.email_sent && <span style={{ marginLeft: "6px" }}>📧</span>}
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
            color: "#00d4ff", borderRadius: "8px", padding: "8px 14px",
            cursor: "pointer", fontSize: "13px", fontFamily: "inherit", transition: "all 0.2s"
          }}
        >
          {expanded ? "▲ Less" : "▼ More"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Summary */}
          {candidate.summary && (
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
              {candidate.summary}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {/* Strengths */}
            {candidate.strengths?.length > 0 && (
              <div>
                <p style={{ color: "#00e896", fontSize: "12px", fontFamily: "'JetBrains Mono'", marginBottom: "10px" }}>
                  ✦ STRENGTHS
                </p>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {candidate.strengths.map((s, i) => (
                    <li key={i} style={{
                      fontSize: "13px", color: "#cbd5e1", paddingLeft: "14px",
                      position: "relative"
                    }}>
                      <span style={{ position: "absolute", left: 0, color: "#00e896" }}>›</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {candidate.weaknesses?.length > 0 && (
              <div>
                <p style={{ color: "#ff4f6d", fontSize: "12px", fontFamily: "'JetBrains Mono'", marginBottom: "10px" }}>
                  ✦ GAPS
                </p>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {candidate.weaknesses.map((w, i) => (
                    <li key={i} style={{
                      fontSize: "13px", color: "#cbd5e1", paddingLeft: "14px",
                      position: "relative"
                    }}>
                      <span style={{ position: "absolute", left: 0, color: "#ff4f6d" }}>›</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Skills */}
            {candidate.top_skills?.length > 0 && (
              <div>
                <p style={{ color: "#ffd166", fontSize: "12px", fontFamily: "'JetBrains Mono'", marginBottom: "10px" }}>
                  ✦ TOP SKILLS
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {candidate.top_skills.map((skill, i) => (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: "12px", fontSize: "12px",
                      background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.3)",
                      color: "#ffd166"
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extra info */}
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {candidate.experience_years > 0 && (
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                🏆 {candidate.experience_years} year{candidate.experience_years !== 1 ? "s" : ""} experience
              </span>
            )}
            {candidate.email && (
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                📧 {candidate.email}
                {candidate.email_sent && <span style={{ color: "#00e896", marginLeft: "6px" }}>• Invite sent!</span>}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
