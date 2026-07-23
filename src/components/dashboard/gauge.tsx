import { NoData } from "./no-data";

const W = 220;
const H = 100;
const BW = 200;
const BH = 14;
const BX = (W - BW) / 2;
const BY = 30;

export function Gauge({
  pct,
  color,
  label,
  unit,
}: {
  pct: number | null;
  color: string;
  label: string;
  unit: string;
}) {
  if (pct === null || pct <= 0) return <NoData />;
  const fw = BW * Math.min(pct / 100, 1);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${label}: ${pct.toFixed(1)}${unit}`}
    >
      <rect x={BX} y={BY} width={BW} height={BH} rx={7} ry={7} fill="#1c2333" />
      {fw > 0 && (
        <rect
          x={BX}
          y={BY}
          width={fw}
          height={BH}
          rx={7}
          ry={7}
          fill={color}
          opacity={0.85}
        />
      )}
      <text
        x={W / 2}
        y={14}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={11}
        fontWeight={600}
        fill={color}
      >
        {label}
      </text>
      <text
        x={W / 2}
        y={BY + BH + 24}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={14}
        fontWeight={700}
        fill="#e6edf3"
      >
        {pct.toFixed(1)}
        {unit}
      </text>
    </svg>
  );
}
