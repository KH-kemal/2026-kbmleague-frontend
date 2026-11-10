import { useState } from 'react';

const series = [
  { key: 'goals_for', label: 'Gol dicetak', color: '#5475ae', bar: true },
  { key: 'goals_against', label: 'Kebobolan', color: '#c45a70', bar: true },
  { key: 'shots', label: 'Tembakan', color: '#278477' },
  { key: 'possession', label: 'Penguasaan bola', color: '#b37b22', percent: true },
];
const getValue = (match, item) => item.bar ? match[item.key] : match.statistics?.[item.key];
const date = value => new Date(value.replace(' ', 'T')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
export default function TeamPerformanceChart({ matches }) {
  const [visible, setVisible] = useState(series.map(item => item.key));
  const [selected, setSelected] = useState(null);
  const active = series.filter(item => visible.includes(item.key));
  const current = Math.min(selected ?? matches.length - 1, matches.length - 1);
  const detail = matches[current];
  const [hovered, setHovered] = useState(null);
  const counts = matches.flatMap(match => active.filter(item => !item.percent).map(item => getValue(match, item))).filter(value => value != null);
  const max = Math.max(4, Math.ceil(Math.max(0, ...counts) / 4) * 4);
  const width = Math.max(620, matches.length * 120 + 120);
  const slot = (width - 120) / Math.max(1, matches.length);
  const x = index => 60 + (index + .5) * slot;
  const y = (value, item) => 240 - value / (item.percent ? 100 : max) * 180;
  const tooltip = hovered == null ? null : matches[hovered];
  if (!matches.length) return <section className="team-stat-panel"><h3>Perkembangan pertandingan</h3><p className="team-chart-empty">Grafik tersedia setelah tim menyelesaikan pertandingan.</p></section>;
  return <section className="team-stat-panel team-performance">
    <div className="team-chart-heading"><div><h3>Perkembangan pertandingan</h3><p className="team-stat-muted">Baca dari kiri ke kanan untuk mengikuti perjalanan tim. Pilih satu laga untuk melihat rinciannya.</p></div></div>
    <div className="team-chart-toggles" role="group" aria-label="Tampilkan data grafik">{series.map(item => <button type="button" key={item.key} aria-pressed={visible.includes(item.key)} onClick={() => setVisible(current => current.includes(item.key) ? current.filter(key => key !== item.key) : [...current, item.key])}><i className={item.percent ? 'chart-key-line' : 'chart-key-bar'} style={{ background: item.color }} />{item.label}<span>{visible.includes(item.key) ? 'Aktif' : 'Tersembunyi'}</span></button>)}</div>
    <p className="team-chart-scroll-hint">Geser ke samping untuk melihat seluruh pertandingan. Sentuh atau arahkan kursor ke kolom laga untuk melihat rincian.</p>
    {!active.length ? <p className="team-chart-empty">Pilih minimal satu data di atas untuk menampilkan grafik.</p> : <div className="team-combo-wrap">
      <div className="team-chart-scroll" tabIndex={0} role="region" aria-label="Grafik perkembangan tim, dapat digeser ke samping" onMouseLeave={() => setHovered(null)}>
        <svg role="img" aria-label="Batang jumlah gol, kebobolan dan tembakan; garis persentase penguasaan bola" viewBox={'0 0 ' + width + ' 290'} style={{ width, minWidth: width, height: 290 }}>
          <title>Jumlah memakai skala kiri. Penguasaan bola memakai skala kanan 0 sampai 100 persen. Data kosong tidak dianggap nol.</title>
          <text x="20" y="22" className="team-chart-label">Jumlah (kiri)</text><text x={width - 15} y="22" textAnchor="end" className="team-chart-label">Penguasaan bola (kanan)</text>
          {[0, .25, .5, .75, 1].map(step => <g key={step}><line x1="55" x2={width - 55} y1={240 - step * 180} y2={240 - step * 180} stroke="currentColor" opacity=".12" /><text x="43" y={244 - step * 180} textAnchor="end" className="team-chart-label">{max * step}</text><text x={width - 43} y={244 - step * 180} className="team-chart-label">{step * 100}%</text></g>)}
          <rect x={x(current) - slot / 2 + 4} y="40" width={slot - 8} height="210" rx="8" fill="#5475ae" opacity=".08" />
          {matches.map((match, index) => <g key={match.id}>
            {active.filter(item => !item.percent).map((item, itemIndex, bars) => {
              const value = getValue(match, item);
              const center = x(index) + (itemIndex - (bars.length - 1) / 2) * 25;
              return value == null ? null : <g key={item.key}><rect x={center - 10} y={y(value, item)} width="20" height={240 - y(value, item)} rx="3" fill={item.color} /><text x={center} y={y(value, item) - 7} textAnchor="middle" className="team-chart-label chart-value">{value}</text></g>;
            })}
            <text x={x(index)} y="274" textAnchor="middle" className="team-chart-label">Pertandingan {index + 1}</text>
          </g>)}
          {active.filter(item => item.percent).map(item => <g key={item.key}>{matches.map((match, index) => {
            const value = getValue(match, item);
            const previous = index ? getValue(matches[index - 1], item) : null;
            if (value == null) return null;
            return <g key={match.id}>{previous != null && <line x1={x(index - 1)} y1={y(previous, item)} x2={x(index)} y2={y(value, item)} stroke={item.color} strokeWidth="3" strokeDasharray="6 3" />}<circle cx={x(index)} cy={y(value, item)} r="5" fill={item.color} /></g>;
          })}</g>)}
          {matches.map((match, index) => <rect key={match.id} x={x(index) - slot / 2} y="35" width={slot} height="215" fill="transparent" onMouseEnter={() => setHovered(index)} onClick={() => { setSelected(index); setHovered(null); }} style={{ cursor: 'pointer' }} />)}
        </svg>
      </div>
      {tooltip && <div className="team-chart-tooltip" role="tooltip"><strong>Pertandingan {hovered + 1} / {tooltip.opponent?.name || 'Lawan'}</strong><span>Gol {tooltip.goals_for} : {tooltip.goals_against}</span>{series.slice(2).map(item => <span key={item.key}>{item.label}: {getValue(tooltip, item) == null ? '-' : getValue(tooltip, item) + (item.percent ? '%' : '')}</span>)}</div>}
    </div>}
    <div className="team-match-strip" role="group" aria-label="Pilih pertandingan">{matches.map((match, index) => <button type="button" key={match.id} aria-pressed={current === index} onClick={() => { setSelected(index); setHovered(null); }}><span>Pertandingan {index + 1} / {date(match.match_date)}</span><strong>{match.goals_for} : {match.goals_against}<i className={'team-result team-result-' + match.result}>{({ W: 'M', D: 'S', L: 'K' })[match.result]}</i></strong><small>{match.opponent?.name || 'Lawan'}</small></button>)}</div>
    <div className="team-chart-detail" aria-live="polite"><div className="team-chart-match"><div><span>{date(detail.match_date)}</span><h4>Pertandingan {current + 1}</h4><span>Melawan {detail.opponent?.name || 'Lawan'}</span></div></div><div className="team-chart-values">{series.map(item => <div key={item.key}><span><i style={{ background: item.color }} />{item.label}</span><strong>{getValue(detail, item) == null ? '-' : getValue(detail, item) + (item.percent ? '%' : '')}</strong></div>)}</div></div>
    <p className="team-stat-muted">Batang biru: gol, merah: kebobolan, hijau: tembakan (skala kiri). Garis emas: penguasaan bola (skala kanan, %). Data kosong tidak digambar dan tidak dianggap nol.</p>
  </section>;
}
