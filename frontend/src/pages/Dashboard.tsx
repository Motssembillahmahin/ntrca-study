import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProgress, type ProgressData } from "../api/progress";
import { ProgressRing } from "../components/ProgressRing";

const WEEKLY_PLAN: Record<number, string> = {
  1: "Bangla Grammar — সন্ধি ও সমাস",
  2: "English Tenses & Voice",
  3: "Math — Percentage & Ratio",
  4: "GK — Bangladesh Constitution",
  5: "ICT — Number Systems",
  6: "ICT — Networking & OSI Model",
  7: "ICT — Database & SQL",
};

export function Dashboard() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    getProgress().then(setProgress).catch(() => {});
  }, []);

  const dayOfWeek = new Date().getDay() || 7;
  const todayTopic = WEEKLY_PLAN[dayOfWeek] ?? "ICT — Number Systems";

  const subjectMap: Record<string, { total: number; correct: number }> = {};
  progress?.topic_stats.forEach((t) => {
    if (!subjectMap[t.subject]) subjectMap[t.subject] = { total: 0, correct: 0 };
    subjectMap[t.subject].total += t.total;
    subjectMap[t.subject].correct += t.correct;
  });

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ marginBottom: 24 }}>NTRCA Study Dashboard</h1>

      <div style={{ background: "#eff6ff", padding: 20, borderRadius: 8, marginBottom: 32 }}>
        <p style={{ margin: 0, color: "#1d4ed8", fontWeight: 600, fontSize: 12 }}>TODAY'S TOPIC</p>
        <p style={{ margin: "6px 0 16px", fontSize: 18, fontWeight: 500 }}>{todayTopic}</p>
        <Link to="/quiz">
          <button style={{
            padding: "10px 20px", background: "#3b82f6", color: "white",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
          }}>
            Start Session →
          </button>
        </Link>
      </div>

      <h2 style={{ marginBottom: 16 }}>Progress by Subject</h2>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
        {Object.entries(subjectMap).map(([subject, data]) => (
          <ProgressRing
            key={subject}
            subject={subject}
            accuracy={data.total > 0 ? data.correct / data.total : 0}
            total={data.total}
          />
        ))}
        {Object.keys(subjectMap).length === 0 && (
          <p style={{ color: "#9ca3af" }}>No data yet — complete a quiz session to see progress.</p>
        )}
      </div>

      {(progress?.weak_areas.length ?? 0) > 0 && (
        <div style={{ background: "#fef2f2", padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <h3 style={{ color: "#dc2626", marginBottom: 8, fontSize: 15 }}>⚠ Weak Areas (below 60%)</h3>
          {progress!.weak_areas.map((w) => (
            <div key={`${w.subject}-${w.subtopic}`}
              style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#7f1d1d", fontSize: 14 }}
            >
              <span>{w.subject} → {w.subtopic}</span>
              <strong>{Math.round(w.accuracy * 100)}%</strong>
            </div>
          ))}
        </div>
      )}

      <Link to="/progress" style={{ color: "#3b82f6", fontSize: 14 }}>View full progress report →</Link>
    </div>
  );
}
