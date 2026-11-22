import { useMemo, useRef, useState } from 'react';
import { compact, fmt, shortDate } from './lib.js';

const W = 720;
const H = 240;
const PAD = { t: 16, r: 16, b: 28, l: 52 };

function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v);
}

/**
 * Single-series area chart with a crosshair tooltip.
 * points: [{ date: Date, value: number }] in date order.
 */
export function AreaChart({ points, label, unit = 'RWF' }) {
  const svg = useRef(null);
  const [hover, setHover] = useState(null);

  const geo = useMemo(() => {
    const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
    const iw = W - PAD.l - PAD.r;
    const ih = H - PAD.t - PAD.b;
    const x = (i) => PAD.l + (points.length < 2 ? iw : (i / (points.length - 1)) * iw);
    const y = (v) => PAD.t + ih - (v / max) * ih;
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
    const area = points.length ? `${line} L${x(points.length - 1)} ${PAD.t + ih} L${x(0)} ${PAD.t + ih} Z` : '';
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: max * f, y: y(max * f) }));
    const step = Math.max(1, Math.ceil(points.length / 6));
    const xTicks = points.map((p, i) => ({ i, p })).filter(({ i }) => i % step === 0 || i === points.length - 1);
    return { x, y, line, area, ticks, xTicks, ih };
  }, [points]);

  const onMove = (e) => {
    if (!points.length || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const iw = W - PAD.l - PAD.r;
    const i = Math.round(((px - PAD.l) / iw) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  const h = hover != null ? points[hover] : null;

  return (
    <figure className="chart">
      <div className="chart-plot" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
          {geo.ticks.map((t) => (
            <g key={t.v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} className="chart-grid" />
              <text x={PAD.l - 10} y={t.y + 4} className="chart-tick" textAnchor="end">{compact(t.v)}</text>
            </g>
          ))}
          {geo.xTicks.map(({ i, p }) => (
            <text key={i} x={geo.x(i)} y={H - 8} className="chart-tick" textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>{shortDate(p.date)}</text>
          ))}
          <path d={geo.area} className="chart-area" />
          <path d={geo.line} className="chart-line" vectorEffect="non-scaling-stroke" />
          {h && (
            <g>
              <line x1={geo.x(hover)} x2={geo.x(hover)} y1={PAD.t} y2={PAD.t + geo.ih} className="chart-cross" vectorEffect="non-scaling-stroke" />
              <circle cx={geo.x(hover)} cy={geo.y(h.value)} r="5" className="chart-dot" vectorEffect="non-scaling-stroke" />
            </g>
          )}
        </svg>
        {h && (
          <div className="chart-tip" style={{ left: `${(geo.x(hover) / W) * 100}%`, top: `${(geo.y(h.value) / H) * 100}%` }}>
            <span>{shortDate(h.date)}</span>
            <strong className="tnum">{fmt(h.value)} {unit}</strong>
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Date</th><th>{unit}</th></tr></thead>
        <tbody>{points.map((p) => <tr key={+p.date}><td>{shortDate(p.date)}</td><td>{fmt(p.value)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/** Cumulative daily series from dated amounts, covering the last `days` days. */
export function cumulativeByDay(rows, days = 30) {
  const end = new Date(); end.setHours(0, 0, 0, 0);
  const start = new Date(end); start.setDate(start.getDate() - (days - 1));
  const sorted = rows.map((r) => ({ t: new Date(r.date).getTime(), v: r.amount })).sort((a, b) => a.t - b.t);
  let running = sorted.filter((r) => r.t < start.getTime()).reduce((s, r) => s + r.v, 0);
  const out = [];
  for (let d = 0; d < days; d++) {
    const day = new Date(start); day.setDate(start.getDate() + d);
    const next = day.getTime() + 86400000;
    running += sorted.filter((r) => r.t >= day.getTime() && r.t < next).reduce((s, r) => s + r.v, 0);
    out.push({ date: day, value: running });
  }
  return out;
}
