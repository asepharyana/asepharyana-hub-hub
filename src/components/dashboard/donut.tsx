import { NoData } from "./no-data";

export function Donut({
  running,
  degraded,
}: {
  running: number;
  degraded: number;
}) {
  const total = running + degraded;
  if (!total) return <NoData />;

  const cx = 100;
  const cy = 90;
  const R = 60;
  const circ = 2 * Math.PI * R;
  const segs = [
    { n: running, c: "#3fb950", l: "Running" },
    { n: degraded, c: "#d29922", l: "Degraded" },
  ];

  let off = 0;
  return (
    <svg
      width={200}
      height={210}
      viewBox="0 0 200 210"
      role="img"
      aria-label="Service health donut chart"
    >
      {segs.map((s) => {
        if (!s.n) return null;
        const frac = s.n / total;
        const ln = frac * circ;
        const el = (
          <circle
            key={s.l}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={s.c}
            strokeWidth={14}
            strokeDasharray={`${ln} ${circ - ln}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        off += ln;
        return el;
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="#e6edf3"
        fontSize={26}
        fontWeight={700}
        fontFamily="system-ui,sans-serif"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#8b949e"
        fontSize={10}
        fontFamily="system-ui,sans-serif"
      >
        total
      </text>
      {segs
        .filter((s) => s.n)
        .map((s, i) => (
          <g key={s.l}>
            <circle cx={16} cy={165 + i * 16} r={4} fill={s.c} />
            <text
              x={26}
              y={168 + i * 16}
              fill="#8b949e"
              fontSize={10}
              fontFamily="system-ui,sans-serif"
            >
              {s.l}: {s.n}
            </text>
          </g>
        ))}
    </svg>
  );
}
