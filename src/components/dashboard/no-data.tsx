export function NoData() {
  return (
    <svg
      width={200}
      height={100}
      viewBox="0 0 200 100"
      role="img"
      aria-label="No data available"
    >
      <text
        x={100}
        y={50}
        textAnchor="middle"
        fill="#6e7681"
        fontSize={12}
        fontFamily="system-ui,sans-serif"
      >
        No data
      </text>
    </svg>
  );
}
