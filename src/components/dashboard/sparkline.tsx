import { NoData } from "./no-data";

const W = 300;
const H = 160;
const PL = 45;
const PT = 20;
const PR = 10;
const PB = 25;
const VW = W - PL - PR;
const VH = H - PT - PB;

function gridLines(maxV: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const y = PT + (VH * i) / 4;
    const val = maxV * (1 - i / 4);
    return (
      <g key={`grid-${y}`}>
        <line
          x1={PL}
          y1={y}
          x2={PL + VW}
          y2={y}
          stroke="#21262d"
          strokeWidth={1}
        />
        <text
          x={PL - 6}
          y={y + 3}
          textAnchor="end"
          fill="#6e7681"
          fontSize={9}
          fontFamily="system-ui,sans-serif"
        >
          {val.toFixed(0)}
        </text>
      </g>
    );
  });
}

function xAxisLabels(length: number) {
  if (length <= 5) return null;
  return Array.from({ length: 5 }, (_, i) => {
    const idx = Math.floor(((i + 1) * (length - 1)) / 5);
    const x = PL + (VW * idx) / (length - 1);
    return (
      <text
        key={`xlabel-${x}`}
        x={x}
        y={PT + VH + 16}
        textAnchor="middle"
        fill="#6e7681"
        fontSize={9}
        fontFamily="system-ui,sans-serif"
      >
        {idx + 1}
      </text>
    );
  });
}

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return <NoData />;

  const maxV = Math.max(...data.map(Math.abs), 1);
  const pts = data
    .map(
      (v, i) =>
        `${(PL + (VW * i) / (data.length - 1)).toFixed(1)},${(PT + VH * (1 - v / maxV)).toFixed(1)}`,
    )
    .join(" ");

  const area = `M${PL},${PT + VH} L${pts} L${PL + VW},${PT + VH} Z`;
  const lv = data[data.length - 1];
  const ly = PT + VH * (1 - lv / maxV);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Sparkline chart"
    >
      {gridLines(maxV)}
      <path d={area} fill={color} opacity={0.15} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <text
        x={PL + VW}
        y={ly - 10}
        textAnchor="end"
        fill={color}
        fontSize={11}
        fontWeight={600}
        fontFamily="system-ui,sans-serif"
      >
        {lv.toFixed(1)}
      </text>
      {xAxisLabels(data.length)}
    </svg>
  );
}
