import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, RefreshCw, Shield, ArrowLeft, ArrowUpRight, Users } from 'lucide-react';
import TeamPerformanceChart from './TeamPerformanceChart';
import api from '../../services/api';
const metricLabels = { possession: 'Penguasaan bola', shots: 'Tembakan', shots_on_target: 'Tepat sasaran', saves: 'Penyelamatan', fouls: 'Pelanggaran', offsides: 'Offside', passes: 'Passing', successful_passes: 'Passing Success', passing_accuracy: 'Akurasi operan', yellow_cards: 'Kartu kuning', red_cards: 'Kartu merah' };

const resultLabels = { W: 'Menang', D: 'Seri', L: 'Kalah' };
const resultLetters = { W: 'M', D: 'S', L: 'K' };
const date = value => new Date(value.replace(' ', 'T')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
function Result({ value }) { return <span className={'team-result team-result-' + value} title={resultLabels[value]} aria-label={resultLabels[value]}>{resultLetters[value]}</span>; }
export default function TeamStatistics({ teams, teamError, teamId, onTeamChange }) {
  const selected = teamId || '';
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const key = selected + ':' + refresh;
  const [state, setState] = useState({ key: '', data: null, error: '' });
  const loading = Boolean(selected) && state.key !== key;
  const data = state.key === key ? state.data : null;
  useEffect(() => {
  if (!selected) return;
    let active = true;
    async function load() {
      try { const { data } = await api.get('/statistics/teams/' + selected); if (active) setState({ key, data, error: '' }); }
      catch { if (active) setState(previous => ({ key, data: previous.key === key ? previous.data : null, error: 'Statistik tim gagal dimuat. Silakan coba lagi.' })); }
    }
    load(); const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [selected, key]);
    async function downloadReport() {
    if (!data || exporting) return;
    setExporting(true);
    setExportError('');
    try {
      const { downloadTeamStatisticsPdf } = await import('./teamStatisticsPdf');
      await downloadTeamStatisticsPdf(data);
    } catch {
      setExportError('PDF gagal dibuat. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  }
  if (!selected) return <section className="team-statistics"><div className="statistics-toolbar"><div><h2 className="text-xl font-bold">Pilih klub</h2><p className="team-stat-muted">Buka klub untuk melihat perjalanan dan evaluasi pertandingannya.</p></div><span className="team-stat-muted">{teams.length} klub</span></div>
    {teamError ? <p role="alert">{teamError}</p> : teams.length ? <div className="team-stat-clubs">{teams.map(team => <button type="button" className="team-stat-club" key={team.id} onClick={() => onTeamChange(String(team.id))}><div className="team-stat-club-heading">{team.logo ? <img src={team.logo} alt="" loading="lazy" /> : <span className="team-stat-club-mark">{team.name.slice(0, 2).toUpperCase()}</span>}<h3>{team.name}</h3></div><div className="team-stat-club-bottom"><span><Users size={15} />{team.players_count ?? 0} pemain</span><strong>Lihat statistik <ArrowUpRight size={15} /></strong></div></button>)}</div> : <p className="statistics-empty">Daftar klub belum tersedia.</p>}
  </section>;
  return <div className="team-statistics"><button type="button" className="team-stat-back" onClick={() => onTeamChange('')}><ArrowLeft size={16} /> Semua klub</button>
    <header className="team-stat-heading team-evaluation-header"><div className="team-identity">{data?.team.logo ? <img src={data.team.logo} alt="" /> : <Shield size={38} />}<div><p>EVALUASI TIM</p><h2>{data?.team.name || teams.find(team => String(team.id) === selected)?.name || 'Statistik tim'}</h2></div></div><div className="team-header-controls"><label><span className="sr-only">Pilih tim evaluasi</span><select value={selected} onChange={event => onTeamChange(event.target.value)}>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><button type="button" className="statistics-refresh" aria-label="Perbarui statistik tim" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={18} /></button><button type="button" className="team-report-download" disabled={!data || loading || exporting} onClick={downloadReport}><Download size={17} />{exporting ? 'Menyiapkan...' : 'Unduh PDF'}</button></div></header>
    {exportError && <p role="alert">{exportError}</p>}
    {teamError && <p role="alert">{teamError}</p>}{!selected && !teamError && <p className="statistics-empty">Pilih tim untuk melihat evaluasi. Tim terdaftar akan tampil di sini.</p>}
    {loading && <p role="status" className="statistics-empty">Memuat statistik tim...</p>}{state.key === key && state.error && <p role="alert" className="text-red-500 mb-4">{state.error}</p>}
    {data && <>
      <div className="team-kpis">
        <article><span>Performa terakhir</span><div className="team-kpi-form" aria-label="Hasil lima laga terakhir, terlama ke terbaru">{data.recent_form.map((result, i) => <Result value={result} key={i} />)}{!data.recent_form.length && <small>Belum ada pertandingan</small>}</div><small>{data.summary.wins} menang / {data.summary.draws} seri / {data.summary.losses} kalah</small></article>
        <article><span>Serangan</span><strong>{data.summary.played ? (data.summary.goals_for / data.summary.played).toFixed(1) : '-'}<small>gol / laga</small></strong><small>{data.metrics.shots.recorded_matches ? data.metrics.shots.average + ' tembakan / laga' : '-'}</small></article>
        <article><span>Pertahanan</span><strong>{data.summary.played ? (data.summary.goals_against / data.summary.played).toFixed(1) : '-'}<small>kebobolan / laga</small></strong><small>{data.summary.clean_sheets} dari {data.summary.played} laga tanpa kebobolan</small></article>
        <article><span>Penguasaan bola</span><strong>{data.metrics.possession.recorded_matches ? data.metrics.possession.average + '%' : '-'}<small>rata-rata</small></strong><small>{data.metrics.possession.recorded_matches ? 'Berdasarkan ' + data.metrics.possession.recorded_matches + ' laga' : '-'}</small></article>
      </div>
      <div className="team-summary-strip"><span><strong>{data.summary.played}</strong> pertandingan</span><span><strong>{data.summary.goals_for}</strong> gol dicetak</span><span><strong>{data.summary.goals_against}</strong> kebobolan</span><span><strong>{data.summary.goal_difference}</strong> selisih gol</span></div>
      {!data.summary.played ? <p className="statistics-empty">Tim ini belum memiliki pertandingan selesai.</p> : <>
      <TeamPerformanceChart key={selected} matches={data.matches} />
      <section className="team-stat-panel"><h3>Statistik permainan</h3><p className="team-stat-muted">Rata-rata per laga dengan data tersedia. Kartu merupakan total. Akurasi operan dihitung dari total operan sukses dibagi total operan pada laga dengan data lengkap.</p><div className="team-metrics team-metrics-refined">{Object.entries(metricLabels).map(([key, label]) => {
        const value = data.metrics[key];
        const cards = key.endsWith('_cards');
        const complete = value?.recorded_matches > 0;
        return <div key={key}><span>{cards && <i className={'team-card-mark ' + key} />}{label}</span><strong>{complete ? (cards ? value.total : value.average) + (['possession', 'passing_accuracy'].includes(key) ? '%' : '') : <small className="team-missing">-</small>}</strong>{['possession', 'passing_accuracy'].includes(key) && complete && <progress max="100" value={value.average} aria-label={label} />}<small>{complete ? 'Berdasarkan ' + value.recorded_matches + ' laga' : ''}</small></div>;
      })}</div></section>
      <section className="team-stat-panel"><h3>Riwayat pertandingan</h3><div className="statistics-table-scroll"><table className="team-history"><caption>Hasil terbaru di atas. M: Menang, S: Seri, K: Kalah. Skor dari sisi tim yang dipilih.</caption><thead><tr>{['Tanggal', 'Lawan', 'Hasil', 'Skor', 'Tembakan', 'Penguasaan bola', 'Detail'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{[...data.matches].reverse().map(match => <tr key={match.id}><td>{date(match.match_date)}</td><td>{match.opponent?.name || 'Klub tidak tersedia'}</td><td><Result value={match.result} /></td><td>{match.goals_for} : {match.goals_against}</td><td>{match.statistics.shots ?? '-'}</td><td>{match.statistics.possession == null ? '-' : match.statistics.possession + '%'}</td><td><Link to={'/fixtures#match-' + match.id}>Lihat laga</Link></td></tr>)}</tbody></table></div></section>
      </>}
    </>}
  </div>;
}
