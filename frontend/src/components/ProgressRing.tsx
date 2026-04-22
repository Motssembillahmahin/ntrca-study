interface Props {
  subject: string;
  accuracy: number;
  total: number;
}

export function ProgressRing({ subject, accuracy, total }: Props) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const fill = circ * Math.min(accuracy, 1);
  const color =
    accuracy >= 0.6 ? "var(--green)" : accuracy >= 0.4 ? "var(--accent)" : "var(--red)";
  const pct = Math.round(accuracy * 100);

  return (
    <div className="ring-card">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke="var(--bg-3)"
          strokeWidth="6"
        />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x="44" y="49"
          textAnchor="middle"
          fontSize="15"
          fontWeight="500"
          fontFamily="DM Mono"
          fill={color}
          letterSpacing="-0.02em"
        >
          {pct}%
        </text>
      </svg>
      <div className="ring-label">{subject}</div>
      <div className="ring-total">{total} Q</div>
    </div>
  );
}
