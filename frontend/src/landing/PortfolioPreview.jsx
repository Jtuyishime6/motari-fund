import { Icon } from '../icons.jsx';

// A simplified investor portfolio. Only the words the story needs are real; the rest are placeholder lines.
const HOLDINGS = [
  { model: 'Spiro Ekon 450', img: '/images/OIP.webp', pct: 100, amt: '150,000', state: 'On the road' },
  { model: 'Ampersand Gen-3', img: '/images/OIP (5).webp-Ampersand.webp', pct: 64, amt: '200,000', state: 'Funding' },
  { model: 'Spiro Ekon Red', img: '/images/OIP (1).webp', pct: 38, amt: '100,000', state: 'Funding' }
];

const LINE = 'M0 120 C40 118 60 112 90 104 S150 96 180 84 S240 70 270 58 S330 44 360 36 S420 22 460 14';

export default function PortfolioPreview() {
  return (
    <div className="pp" aria-label="Preview of the investor portfolio">
      <aside className="pp-side">
        <img src="/images/motari-wordmark.png" alt="" className="pp-logo" />
        <div className="pp-nav on"><Icon n="grid" size={15} /> Portfolio</div>
        <div className="pp-nav"><Icon n="scooter" size={15} /> E-motos</div>
        <div className="pp-nav"><Icon n="clock" size={15} /> Activity</div>
        <div className="pp-side-foot"><span className="demo-avatar">A</span><span className="demo-line" style={{ width: 60 }} /></div>
      </aside>
      <div className="pp-main">
        <div className="pp-head">
          <div>
            <div className="pp-hi">Good morning, Alice</div>
            <span className="demo-line" style={{ width: 160 }} />
          </div>
          <span className="pp-btn"><Icon n="plus" size={14} /> Invest</span>
        </div>

        <div className="pp-kpis">
          <div className="pp-kpi"><span>Invested</span><strong className="tnum">450,000</strong><em>RWF across 3 e-motos</em></div>
          <div className="pp-kpi"><span>Projected return</span><strong className="tnum up">+292,500</strong><em>Up to 65% over 24 months</em></div>
          <div className="pp-kpi"><span>E-motos backed</span><strong className="tnum">3</strong><em>1 already on the road</em></div>
        </div>

        <div className="pp-row">
          <div className="pp-card pp-chart">
            <div className="pp-card-h"><strong>Capital committed</strong><span className="demo-line" style={{ width: 70 }} /></div>
            <svg viewBox="0 0 460 130" preserveAspectRatio="none" role="img" aria-label="Capital committed rising over time">
              {[30, 65, 100].map((y) => <line key={y} x1="0" x2="460" y1={y} y2={y} className="pp-grid" />)}
              <path d={LINE + ' L460 130 L0 130 Z'} className="pp-area" />
              <path d={LINE} className="pp-line" />
              <circle cx="460" cy="14" r="4" className="pp-dot" />
            </svg>
          </div>
          <div className="pp-card pp-holdings">
            <div className="pp-card-h"><strong>Your e-motos</strong></div>
            {HOLDINGS.map((h) => (
              <div className="pp-hold" key={h.model}>
                <img src={h.img} alt="" />
                <div className="pp-hold-main">
                  <div className="pp-hold-top"><strong>{h.model}</strong><span className="tnum">{h.amt}</span></div>
                  <div className="bar sm"><i style={{ width: h.pct + '%' }} /></div>
                  <span className="pp-hold-state">{h.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
