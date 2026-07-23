'use client';

import { useEffect, useState } from 'react';

interface Service {
  name: string;
  state: string;
  hasWeb: boolean;
}

interface Trace {
  service: string;
  operation: string;
  duration: number;
  spans: number;
  hasError: boolean;
}

interface DashboardData {
  services: Service[];
  traces: Trace[];
  node: {
    cpu: number | null;
    ram: number | null;
    disk: number | null;
    load1: number | null;
    load5: number | null;
    load15: number | null;
    netIn: number | null;
    netOut: number | null;
  };
  rps: number[];
  latency: number[];
  errors: number[];
  traceVolume: number[];
  links: { url: string; label: string }[];
}

function safeDur(us: number): string {
  if (us < 1000) return `${us}µs`;
  if (us < 1_000_000) return `${(us / 1000).toFixed(1)}ms`;
  return `${(us / 1_000_000).toFixed(2)}s`;
}

function Donut({ running, degraded }: { running: number; degraded: number }) {
  const total = running + degraded;
  if (!total) return <NoData />;

  const cx = 100, cy = 90, R = 60, circ = 2 * Math.PI * R;
  const segs = [
    { n: running, c: '#3fb950', l: 'Running' },
    { n: degraded, c: '#d29922', l: 'Degraded' },
  ];

  let off = 0;
  return (
    <svg width={200} height={210} viewBox="0 0 200 210">
      <style>{`.sl{font-family:system-ui,sans-serif;font-size:10px;fill:#8b949e}`}</style>
      {segs.map((s) => {
        if (!s.n) return null;
        const frac = s.n / total;
        const ln = frac * circ;
        const el = (
          <circle key={s.l} cx={cx} cy={cy} r={R} fill="none" stroke={s.c} strokeWidth={14}
            strokeDasharray={`${ln} ${circ - ln}`} strokeDashoffset={-off}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
        off += ln;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#e6edf3" fontSize={26} fontWeight={700} fontFamily="system-ui,sans-serif">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="sl">total</text>
      {segs.filter(s => s.n).map((s, i) => (
        <g key={s.l}>
          <circle cx={16} cy={165 + i * 16} r={4} fill={s.c} />
          <text x={26} y={168 + i * 16} className="sl">{s.l}: {s.n}</text>
        </g>
      ))}
    </svg>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 300, h = 160, pl = 45, pt = 20, pr = 10, pb = 25;
  const vw = w - pl - pr, vh = h - pt - pb;
  if (!data.length) return <NoData />;

  const maxV = Math.max(...data.map(Math.abs), 1);

  const pts = data.map((v, i) =>
    `${(pl + vw * i / (data.length - 1)).toFixed(1)},${(pt + vh * (1 - v / maxV)).toFixed(1)}`
  ).join(' ');

  const area = `M${pl},${pt + vh} L${pts} L${pl + vw},${pt + vh} Z`;
  const lv = data[data.length - 1];
  const ly = pt + vh * (1 - lv / maxV);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <style>{`.ax{font-family:system-ui,sans-serif;font-size:9px;fill:#6e7681}`}</style>
      {[0, 1, 2, 3, 4].map(i => {
        const y = pt + vh * i / 4;
        return (
          <g key={i}>
            <line x1={pl} y1={y} x2={pl + vw} y2={y} stroke="#21262d" strokeWidth={1} />
            <text x={pl - 6} y={y + 3} textAnchor="end" className="ax">{(maxV * (1 - i / 4)).toFixed(0)}</text>
          </g>
        );
      })}
      <path d={area} fill={color} opacity={0.15} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <text x={pl + vw} y={ly - 10} textAnchor="end" fill={color} fontSize={11} fontWeight={600}
        fontFamily="system-ui,sans-serif">{lv.toFixed(1)}</text>
      {data.length > 5 && [...Array(5)].map((_, i) => {
        const idx = Math.floor((i + 1) * (data.length - 1) / 5);
        const x = pl + vw * idx / (data.length - 1);
        return <text key={i} x={x} y={pt + vh + 16} textAnchor="middle" className="ax">{idx + 1}</text>;
      })}
    </svg>
  );
}

function Gauge({ pct, color, label, unit }: { pct: number | null; color: string; label: string; unit: string }) {
  if (pct === null || pct <= 0) return <NoData />;
  const w = 220, h = 100, bw = 200, bh = 14;
  const bx = (w - bw) / 2, by = 30;
  const fw = bw * Math.min(pct / 100, 1);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <style>{`.gt{font-family:system-ui,sans-serif;font-size:11px;fill:#8b949e;text-anchor:middle}`}</style>
      <rect x={bx} y={by} width={bw} height={bh} rx={7} ry={7} fill="#1c2333" />
      {fw > 0 && <rect x={bx} y={by} width={fw} height={bh} rx={7} ry={7} fill={color} opacity={0.85} />}
      <text x={w / 2} y={14} className="gt" fontWeight={600} fill={color}>{label}</text>
      <text x={w / 2} y={by + bh + 24} className="gt" fill="#e6edf3" fontSize={14} fontWeight={700}>
        {pct.toFixed(1)}{unit}
      </text>
    </svg>
  );
}

function NoData() {
  return (
    <svg width={200} height={100} viewBox="0 0 200 100">
      <text x={100} y={50} textAnchor="middle" fill="#6e7681" fontSize={12} fontFamily="system-ui,sans-serif">No data</text>
    </svg>
  );
}

function Pill({ state }: { state: string }) {
  const dot: Record<string, string> = { running: '#3fb950', jaeger: '#58a6ff', exited: '#f85149', restarting: '#d29922' };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 8px', border: '1px solid #30363d', borderRadius: 5, fontSize: 11, background: '#0d1117' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot[state] || '#8b949e', flexShrink: 0 }} />
    <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 10 }}>{state}</span>
  </span>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) setData(await res.json());
      } catch { /* ignore */ }
    };
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const running = data?.services.filter(s => s.state === 'running').length ?? 0;
  const degraded = (data?.services.length ?? 0) - running;
  const hasNode = data?.node.cpu !== null || data?.node.ram !== null;
  const hasTraffik = (data?.rps?.length ?? 0) > 0 || (data?.latency?.length ?? 0) > 0;
  const hasOTel = false;
  const node = data?.node;
  const gaugeColor = (v: number | null) => {
    if (v === null) return '#3fb950';
    if (v > 80) return '#f85149';
    if (v > 60) return '#d29922';
    return '#3fb950';
  };

  return (
    <div style={{ background: '#0d1117', color: '#e6edf3', minHeight: '100vh', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", lineHeight: 1.5 }}>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        @media(min-width:769px){.grid{grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}}
        .card{border:1px solid #30363d;border-radius:8px;padding:14px;background:#161b22;transition:border-color .2s}
        .card:hover{border-color:#3d444d}
        @media(max-width:480px){.card{padding:12px;border-radius:6px}}
        .card-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px}
        .card-h h2{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#8b949e}
        .card-h .badge{font-size:9px;background:#1c2333;padding:2px 8px;border-radius:8px;color:#8b949e;white-space:nowrap}
        .card-c{display:flex;justify-content:center;align-items:center;width:100%}
        ::-webkit-scrollbar{width:8px}
        ::-webkit-scrollbar-thumb{background:#30363d;border-radius:4px}
        .link{color:#58a6ff;text-decoration:none;font-size:10px;padding:4px 8px;border:1px solid #30363d;border-radius:5px;transition:all .15s;line-height:1.4}
        .link:hover{background:#1c2333;border-color:#58a6ff}
        .stat-box{background:#1c2333;border-radius:6px;padding:10px 6px;text-align:center}
        .stat-val{font-size:20px;font-weight:700;font-family:'SF Mono','Fira Code',monospace;line-height:1.2}
        .stat-lbl{font-size:9px;color:#8b949e;margin-top:2px;text-transform:uppercase;letter-spacing:.04em}
      `}</style>

      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', borderBottom: '1px solid #30363d',
        background: 'rgba(22,27,34,.92)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg,#58a6ff,#bc8cff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0,
          }}>H</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600 }}>Hub Dashboard</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
            padding: '4px 12px', borderRadius: 20, fontWeight: 500,
            background: degraded ? 'rgba(210,153,34,.12)' : 'rgba(63,185,80,.12)',
            color: degraded ? '#d29922' : '#3fb950',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: degraded ? '#d29922' : '#3fb950' }} />
            {degraded ? `${degraded} degraded` : 'All Systems Operational'}
          </span>
          <span style={{ color: '#6e7681', fontSize: 10 }}>{time}</span>
        </div>
      </header>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '12px 16px' }}>
        <div className="grid" style={{ display: 'grid', gap: 10 }}>
          {/* Services */}
          <div className="card">
            <div className="card-h"><h2>Services</h2><span className="badge">{data?.services.length ?? 0}</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {data?.services.map(s => (
                <span key={s.name} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 8px', border: '1px solid #30363d', borderRadius: 5, fontSize: 11,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: s.state === 'running' ? '#3fb950' : s.state === 'jaeger' ? '#58a6ff' : '#f85149',
                  }} />
                  <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 10 }}>{s.name}</span>
                </span>
              )) || <span style={{ color: '#6e7681', padding: 16, textAlign: 'center', width: '100%', fontSize: 11 }}>No services detected</span>}
            </div>
          </div>

          {/* Overview */}
          <div className="card">
            <div className="card-h"><h2>Overview</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div className="stat-box"><div className="stat-val" style={{ color: '#58a6ff' }}>{data?.services.length ?? '-'}</div><div className="stat-lbl">Total</div></div>
              <div className="stat-box"><div className="stat-val" style={{ color: '#58a6ff' }}>{running}</div><div className="stat-lbl">Healthy</div></div>
              <div className="stat-box"><div className="stat-val" style={{ color: '#3fb950' }}>{data?.traces.length ?? 0}</div><div className="stat-lbl">Traces</div></div>
              <div className="stat-box"><div className="stat-val" style={{ color: '#f85149' }}>0</div><div className="stat-lbl">Errors</div></div>
            </div>
          </div>

          {/* Health */}
          <div className="card">
            <div className="card-h"><h2>Health</h2></div>
            <div className="card-c"><Donut running={running} degraded={degraded} /></div>
          </div>

          {/* Links */}
          <div className="card">
            <div className="card-h"><h2>Links</h2></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {data?.links.map(l => (
                <a key={l.url} href={l.url} target="_blank" className="link">{l.label}</a>
              ))}
            </div>
          </div>

          {/* Node Resources */}
          {hasNode && (
            <div className="card">
              <div className="card-h">
                <h2>System Resources</h2>
                <span className="badge">{node?.load1?.toFixed(2)} {node?.load5?.toFixed(2)} {node?.load15?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 6 }}>
                <div className="card-c"><Gauge pct={node?.cpu ?? null} color={gaugeColor(node?.cpu ?? null)} label="CPU Usage" unit="%" /></div>
                <div className="card-c"><Gauge pct={node?.ram ?? null} color={gaugeColor(node?.ram ?? null)} label="Memory Usage" unit="%" /></div>
                <div className="card-c"><Gauge pct={node?.disk ?? null} color={gaugeColor(node?.disk ?? null)} label="Disk Usage" unit="%" /></div>
              </div>
            </div>
          )}

          {/* Request Rate */}
          {hasTraffik && (
            <div className="card">
              <div className="card-h"><h2>Request Rate</h2><span className="badge">{data?.rps?.length ? `${data.rps[data.rps.length - 1].toFixed(1)}/s` : '-'}</span></div>
              <div className="card-c"><Sparkline data={data?.rps ?? []} color="#58a6ff" /></div>
            </div>
          )}

          {/* Latency */}
          {hasTraffik && (
            <div className="card">
              <div className="card-h"><h2>Latency</h2><span className="badge">{data?.latency?.length ? `${data.latency[data.latency.length - 1].toFixed(0)}ms` : '-'}</span></div>
              <div className="card-c"><Sparkline data={data?.latency ?? []} color="#bc8cff" /></div>
            </div>
          )}

          {/* Error Rate */}
          {hasTraffik && (
            <div className="card">
              <div className="card-h"><h2>Error Rate</h2><span className="badge">{data?.errors?.length ? `${data.errors[data.errors.length - 1].toFixed(1)}/s` : '-'}</span></div>
              <div className="card-c"><Sparkline data={data?.errors ?? []} color="#f85149" /></div>
            </div>
          )}

          {/* Trace Volume */}
          <div className="card">
            <div className="card-h"><h2>Trace Volume</h2><span className="badge">{data?.traces.length ?? 0} traces</span></div>
            <div className="card-c"><Sparkline data={data?.traceVolume ?? []} color="#3fb950" /></div>
          </div>

          {/* Traces */}
          <div className="card">
            <div className="card-h"><h2>Recent Traces</h2><span className="badge">{data?.traces.length ?? 0}</span></div>
            {data?.traces.length ? (
              <ul style={{ listStyle: 'none' }}>
                {data.traces.map((t, i) => (
                  <li key={i} style={{
                    padding: '6px 0', borderBottom: '1px solid #21262d',
                    fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.service}</div>
                      <div style={{ color: '#8b949e', fontSize: 10, fontFamily: "'SF Mono','Fira Code',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{t.operation}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#8b949e', flexShrink: 0, alignItems: 'center' }}>
                      <span style={{ fontFamily: "'SF Mono',monospace", fontWeight: 500, color: '#58a6ff' }}>{safeDur(t.duration)}</span>
                      <span>{t.spans}</span>
                      {t.hasError && <span style={{ color: '#f85149', padding: '1px 5px', borderRadius: 3, background: 'rgba(248,81,73,.1)', fontSize: 9 }}>err</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <div style={{ textAlign: 'center', padding: 16, color: '#6e7681', fontSize: 11 }}>No traces — data appears once services send OTel telemetry</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
