import { useEffect, useState } from "react";
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

export function Progress() {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    getProgress().then(setData).catch(() => {});
  }, []);

  const chartData =
    data?.topic_stats.map((t) => ({
      name: t.subtopic.length > 22 ? t.subtopic.slice(0, 22) + "…" : t.subtopic,
      accuracy: Math.round(t.accuracy * 100),
      total: t.total,
    })) ?? [];

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ marginBottom: 24 }}>Progress Report</h1>

      {data && (
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Questions", value: data.total_questions, color: "#eff6ff" },
            { label: "Total Correct", value: data.total_correct, color: "#f0fdf4" },
            {
              label: "Overall Accuracy",
              value: `${Math.round(data.overall_accuracy * 100)}%`,
              color: "#fefce8",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ flex: 1, padding: 20, background: stat.color, borderRadius: 8 }}
            >
              <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>{stat.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginBottom: 16 }}>Accuracy by Subtopic</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-40}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`, "Accuracy"]} />
            <Bar dataKey="accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: "#9ca3af" }}>No quiz data yet. Start a session to track progress.</p>
      )}

      {(data?.weak_areas.length ?? 0) > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 12 }}>Weak Areas</h2>
          {data!.weak_areas.map((w) => (
            <div
              key={`${w.subject}-${w.subtopic}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#fef2f2",
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>
                <strong>{w.subject}</strong> → {w.subtopic}
              </span>
              <strong style={{ color: "#dc2626" }}>{Math.round(w.accuracy * 100)}%</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
