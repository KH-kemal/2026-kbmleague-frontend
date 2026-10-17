import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Trophy, CalendarDays, Users, Shield, RefreshCw } from 'lucide-react';
import FixtureCard from '../../components/FixtureCard';
import useFixtures from '../../hooks/useFixtures';
import api from '../../services/api';
const formatDate = value => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function ClubMark({ team }) { return team?.logo ? <img className="club-mark" src={team.logo} alt="" /> : <span className="club-mark">{(team?.name || 'KB').slice(0, 2).toUpperCase()}</span>; }
function SectionHeading({ eyebrow, title, to, label }) { return <div className="home-section-heading"><div><span className="public-eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link to={to}>{label} <ArrowUpRight size={17} /></Link></div>; }
export default function Home() {
  const [data, setData] = useState({ standings: [], counts: null });
  const { fixtures, error: fixtureError } = useFixtures();
  const liveMatches = fixtures.filter(match => match.status === 'live');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  function load() {
    return Promise.all([api.get('/league-table'), api.get('/dashboard-stats')])
      .then(([standings, counts]) => {
        setData({ standings: standings.data, counts: counts.data });
      })
      .catch(() => setError('Data kompetisi belum dapat dimuat. Silakan coba kembali.'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { document.title = 'KBMLeague | Setiap laga punya cerita'; load(); }, []);
  const upcoming = fixtures.filter(match => match.status === 'scheduled');
  const matches = upcoming.length ? upcoming.slice(0, 3) : [...fixtures].filter(match => match.status === 'completed').reverse().slice(0, 3);
  const featured = upcoming[0];
  const metrics = [[Shield, 'Tim terdaftar', data.counts?.total_teams], [Users, 'Pemain', data.counts?.total_players], [CalendarDays, 'Pertandingan', data.counts?.total_fixtures], [Trophy, 'Laga selesai', data.counts?.completed_fixtures]];
  return <div className="public-home">
    {fixtureError && <p role="alert" className="max-w-7xl mx-auto px-6 pt-5 text-amber-600">{fixtureError}</p>}
    {liveMatches.length > 0 && <section aria-label="Pertandingan berlangsung" className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
      <div className="mb-5"><h2 className="text-2xl font-black text-slate-800 dark:text-white">Sedang Berlangsung</h2><p className="text-sm text-slate-500 dark:text-slate-400">Ikuti skor dan statistik langsung. Pembaruan otomatis setiap 15 detik.</p></div>
      <div className="space-y-5">{liveMatches.map(fixture => <FixtureCard key={fixture.id} fixture={fixture} />)}</div>
    </section>}
    <section className="home-hero"><div className="home-hero-copy"><span className="hero-kicker"><span /> RUMAH BAGI CERITA SEPAK BOLA</span><h1>Lebih dari laga.<br />Ini tentang <em>cerita.</em></h1><p>Dari peluit pertama sampai gol penentu. Ikuti perjalanan tim, kenali para pemain, dan kenali sekolah asal mereka.</p><div className="hero-actions"><Link className="hero-primary" to="/fixtures">Jelajahi pertandingan <ArrowUpRight size={19} /></Link><Link className="hero-secondary" to="/league-table">Lihat klasemen <ArrowRight size={17} /></Link></div><div className="hero-caption"><span className="hero-caption-line" /> Tim. Sekolah. Pertandingan. Satu lapangan.</div></div>
      <div className="hero-visual"><div className="pitch-glow" /><div className="hero-pitch" aria-hidden="true"><svg viewBox="0 0 360 460" fill="none"><rect x="20" y="20" width="320" height="420" rx="4" /><path d="M20 230h320" /><circle cx="180" cy="230" r="52" /><circle cx="180" cy="230" r="3" fill="currentColor" /><path d="M90 20v74h180V20M135 20v30h90V20M90 440v-74h180v74M135 440v-30h90v30" /><circle cx="180" cy="70" r="3" fill="currentColor" /><circle cx="180" cy="390" r="3" fill="currentColor" /></svg><span className="pitch-player p-one">9</span><span className="pitch-player p-two">7</span><span className="pitch-player p-three">10</span><span className="pitch-player p-four">4</span><span className="pitch-player p-five">1</span></div><div className="hero-visual-label"><Trophy size={16} /> THE BEAUTIFUL GAME</div><div className="hero-match-card"><span className="public-eyebrow">{featured ? 'PERTANDINGAN BERIKUTNYA' : 'KOMPETISI KBMLEAGUE'}</span>{featured ? <><div className="hero-match-teams"><ClubMark team={featured.home_team} /><strong>{featured.home_team?.name}</strong><span>vs</span><strong>{featured.away_team?.name}</strong><ClubMark team={featured.away_team} /></div><small>{formatDate(featured.match_date)} · {featured.venue || 'Venue belum ditentukan'}</small></> : <><strong>Lapangan siap. Cerita menanti.</strong><small>{loading ? 'Memuat jadwal kompetisi...' : error ? 'Jadwal belum dapat dimuat.' : 'Jadwal pertandingan akan tampil di sini.'}</small></>}<Link to="/fixtures" aria-label="Lihat jadwal pertandingan"><ArrowUpRight size={18} /></Link></div></div>
    </section>
    <div className="home-body"><section className="home-metrics" aria-label="Ringkasan kompetisi">{metrics.map(([Icon, label, value]) => <div key={label}><Icon size={21} /><div><strong>{loading || error ? '—' : value ?? 0}</strong><span>{label}</span></div></div>)}</section>
      {error && <div className="home-error" role="alert"><span>{error}</span><button onClick={() => { setLoading(true); setError(''); load(); }}><RefreshCw size={15} /> Coba lagi</button></div>}
      {loading ? <div className="home-loading" role="status"><span className="home-spinner" /> Menyiapkan cerita kompetisi...</div> : !error && <>
      <section className="home-competition-grid"><div><SectionHeading eyebrow="MATCH CENTER" title={upcoming.length ? 'Laga yang dinanti.' : 'Dari lapangan.'} to="/fixtures" label="Semua pertandingan" /><div className="home-match-list">{matches.length ? matches.map(match => <Link to="/fixtures" className="home-match-row" key={match.id}><div className="home-match-date"><CalendarDays size={15} /><span>{formatDate(match.match_date)}</span></div><div className="home-match-clubs"><ClubMark team={match.home_team} /><strong>{match.home_team?.name}</strong><span className="match-score">{match.status === 'completed' ? `${match.home_score} : ${match.away_score}` : 'VS'}</span><strong>{match.away_team?.name}</strong><ClubMark team={match.away_team} /></div><span className="home-match-status">{match.status === 'completed' ? 'Selesai' : 'Terjadwal'}</span></Link>) : <div className="home-empty"><CalendarDays size={32} /><h3>Peluit pertama belum berbunyi.</h3><p>Jadwal dan hasil pertandingan akan hadir di sini.</p></div>}</div></div>
      <div><SectionHeading eyebrow="LEAGUE TABLE" title="Peta persaingan." to="/league-table" label="Klasemen" /><div className="home-standings"><div className="home-standing-label"><span>Klub</span><span>Main / Poin</span></div>{data.standings.length ? data.standings.slice(0,4).map((row,index) => <Link className="home-standing-row" to={`/teams/${row.team.id}`} key={row.team.id}><span className="standing-rank">{String(index+1).padStart(2,'0')}</span><ClubMark team={row.team} /><strong>{row.team.name}</strong><span>{row.played}</span><b>{row.points}</b></Link>) : <div className="home-empty"><Trophy size={28} /><p>Tim terdaftar akan muncul di klasemen.</p></div>}</div></div></section>
      </>}
      <section className="home-explore"><div><span className="public-eyebrow">TEMUKAN SISI LAIN PERMAINAN</span><h2>Kenali klubnya.<br />Temukan talentanya.</h2><p>Setiap tim punya identitas. Setiap pemain punya perjalanan. Mulai jelajahi mereka.</p></div><div className="home-explore-links"><Link to="/teams"><Shield size={25} /><div><strong>Klub & tim</strong><small>Identitas, skuad, dan perjalanan tim.</small></div><ArrowUpRight size={22} /></Link><Link to="/players"><Users size={25} /><div><strong>Profil pemain</strong><small>Identitas, asal sekolah, dan tim pemain.</small></div><ArrowUpRight size={22} /></Link></div></section>
    </div>
  </div>;
}
