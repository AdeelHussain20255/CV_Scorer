"use client";

export default function StatsBar({ results }) {
  const { total, qualified, threshold } = results;
  const rejected = total - qualified;
  const qualifyRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

  const stats = [
    { label: "Total Screened", value: total, color: "#00d4ff", icon: "👥" },
    { label: "Qualified", value: qualified, color: "#00e896", icon: "✅" },
    { label: "Rejected", value: rejected, color: "#ff4f6d", icon: "❌" },
    { label: "Pass Rate", value: `${qualifyRate}%`, color: "#ffd166", icon: "📊" },
  ];

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "20px", flexWrap: "wrap", gap: "12px"
      }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800,
          background: "linear-gradient(135deg, #fff, #00d4ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          Screening Results
        </h2>
        <span style={{
          padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
          fontFamily: "'JetBrains Mono'", color: "#00d4ff",
          background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)"
        }}>
          Threshold: {threshold}%
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: s.color, fontFamily: "'Syne'" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
