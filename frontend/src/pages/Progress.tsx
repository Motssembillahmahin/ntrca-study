import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getProgress, type ProgressData } from "../api/progress";

const TOOLTIP_STYLE = {
  background: "var(--bg-2)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "var(--text)",
  fontSize: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
};

export function Progress() {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    getProgress().then(setData).catch(() => {});
  }, []);

  const chartData =
    data?.topic_stats.map((t) => ({
      name: t.subtopic.length > 20 ? t.subtopic.slice(0, 20) + "…" : t.subtopic,
      accuracy: Math.round(t.accuracy * 100),
      total: t.total,
    })) ?? [];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header animate-in">
        <div className="page-header-date">Analytics</div>
        <h1 className="display-xl">Progress Report</h1>
        <p className="text-muted" style={{ marginTop: 6, fontSize: 14 }}>
          Your accuracy and performance across all practice sessions.
        </p>
      </div>

      {/* Stats */}
      {data && (
        <div className="stats-row animate-in animate-in-delay-1">
          {[
            { label: "Questions Attempted", value: String(data.total_questions) },
            { label: "Correct Answers",     value: String(data.total_correct) },
            {
              label: "Overall Accuracy",
              value: `${Math.round(data.overall_accuracy * 100)}%`,
              green: data.overall_accuracy >= 0.6,
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

      {/* Chart */}
      <div className="animate-in animate-in-delay-2">
        <h2 className="section-heading">Accuracy by Subtopic</h2>
        {chartData.length > 0 ? (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ bottom: 64, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-38}
                  textAnchor="end"
                  interval={0}
                  tick={{ fill: "#7a90aa", fontSize: 11, fontFamily: "DM Sans" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#7a90aa", fontSize: 11, fontFamily: "DM Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [`${v}%`, "Accuracy"]}
                  labelStyle={{ color: "var(--text-2)", marginBottom: 4 }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="accuracy"
                  fill="var(--accent)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="card"
            style={{ textAlign: "center", padding: "52px 24px", color: "var(--text-2)" }}
          >
            <div style={{ fontSize: 13 }}>
              No quiz data yet.{" "}
              <Link to="/quiz" style={{ color: "var(--accent)" }}>
                Start a session
              </Link>{" "}
              to track your progress.
            </div>
          </div>
        )}
      </div>

      {/* Weak Areas */}
      {(data?.weak_areas.length ?? 0) > 0 && (
        <div className="animate-in animate-in-delay-3" style={{ marginTop: 8 }}>
          <h2 className="section-heading">Weak Areas</h2>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
            Topics below 60% accuracy — focus here to improve your score.
          </p>
          {data!.weak_areas.map((w) => (
            <div className="weak-area-item" key={`${w.subject}-${w.subtopic}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge badge-red">{w.subject}</span>
                <span style={{ fontSize: 13.5 }}>{w.subtopic}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="mono text-red" style={{ fontSize: 15, fontWeight: 500 }}>
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

      {/* Sessions list */}
      {(data?.topic_stats.length ?? 0) > 0 && (
        <div className="animate-in animate-in-delay-4" style={{ marginTop: 8 }}>
          <h2 className="section-heading">All Topics</h2>
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Subject", "Subtopic", "Questions", "Correct", "Accuracy"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 18px",
                        textAlign: "left",
                        fontSize: 10.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--text-3)",
                        fontWeight: 600,
                        background: "var(--bg-1)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.topic_stats.map((t, i) => {
                  const color =
                    t.accuracy >= 0.6
                      ? "var(--green)"
                      : t.accuracy >= 0.4
                      ? "var(--accent)"
                      : "var(--red)";
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: i < data!.topic_stats.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background var(--ease)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-3)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "12px 18px" }}>
                        <span className="badge badge-accent">{t.subject}</span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 13.5 }}>{t.subtopic}</td>
                      <td style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        {t.total}
                      </td>
                      <td style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        {t.correct}
                      </td>
                      <td style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color }}>
                        {Math.round(t.accuracy * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
