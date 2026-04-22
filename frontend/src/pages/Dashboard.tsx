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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

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

  const hasData = Object.keys(subjectMap).length > 0;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header animate-in">
        <div className="page-header-date">{formatDate()}</div>
        <h1 className="display-xl">{getGreeting()}</h1>
        <p className="text-muted" style={{ marginTop: 6, fontSize: 14 }}>
          Your NTRCA ICT exam preparation hub
        </p>
      </div>

      {/* Today's Focus */}
      <div className="today-card animate-in animate-in-delay-1">
        <div className="caption" style={{ marginBottom: 10 }}>Today's Focus</div>
        <div
          className="display-md text-accent"
          style={{ marginBottom: 6 }}
        >
          {todayTopic}
        </div>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 22 }}>
          Stay consistent — one focused session per evening keeps you on track.
        </p>
        <Link to="/quiz">
          <button className="btn btn-primary btn-lg">
            Start Session <ArrowRight />
          </button>
        </Link>
      </div>

      {/* Stats */}
      {progress && (
        <div className="stats-row animate-in animate-in-delay-2">
          {[
            { label: "Questions Attempted", value: String(progress.total_questions) },
            { label: "Correct Answers",     value: String(progress.total_correct) },
            {
              label: "Overall Accuracy",
              value: `${Math.round(progress.overall_accuracy * 100)}%`,
              green: progress.overall_accuracy >= 0.6,
            },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="caption">{s.label}</div>
              <div
                className="stat-value"
                style={s.green ? { color: "var(--green)" } : undefined}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject Progress */}
      {hasData && (
        <div className="animate-in animate-in-delay-3" style={{ marginBottom: 32 }}>
          <h2 className="section-heading">Progress by Subject</h2>
          <div className="rings-row">
            {Object.entries(subjectMap).map(([subject, data]) => (
              <ProgressRing
                key={subject}
                subject={subject}
                accuracy={data.total > 0 ? data.correct / data.total : 0}
                total={data.total}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!progress && (
        <div
          className="card animate-in animate-in-delay-2"
          style={{ textAlign: "center", padding: "52px 24px" }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              color: "var(--text-3)",
              marginBottom: 14,
              lineHeight: 1,
            }}
          >
            ◎
          </div>
          <p className="text-muted" style={{ fontSize: 14 }}>
            No quiz data yet — complete your first session to see progress.
          </p>
        </div>
      )}

      {/* Weak Areas */}
      {(progress?.weak_areas.length ?? 0) > 0 && (
        <div className="animate-in animate-in-delay-4">
          <h2 className="section-heading">Needs Attention</h2>
          {progress!.weak_areas.map((w) => (
            <div className="weak-area-item" key={`${w.subject}-${w.subtopic}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge badge-red">{w.subject}</span>
                <span style={{ fontSize: 13.5 }}>{w.subtopic}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="mono text-red"
                  style={{ fontSize: 15, fontWeight: 500 }}
                >
                  {Math.round(w.accuracy * 100)}%
                </span>
                <Link to="/quiz">
                  <button className="btn btn-sm btn-outline">Practice</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <Link
          to="/progress"
          style={{
            color: "var(--text-2)",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "color var(--ease)",
          }}
        >
          View full progress report <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
