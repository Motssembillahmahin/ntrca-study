interface Props {
  subject: string;
  accuracy: number;
  total: number;
}

export function ProgressRing({ subject, accuracy, total }: Props) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = circ * Math.min(accuracy, 1);
  const color = accuracy >= 0.6 ? "#10b981" : accuracy >= 0.4 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ textAlign: "center", width: 100 }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>
          {Math.round(accuracy * 100)}%
        </text>
      </svg>
      <p style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{subject}</p>
      <p style={{ fontSize: 11, color: "#9ca3af" }}>{total} Q</p>
    </div>
  );
}
