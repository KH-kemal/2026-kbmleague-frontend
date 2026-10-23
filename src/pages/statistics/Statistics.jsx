import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy, Hand, CalendarDays, Goal, RefreshCw, ArrowUpRight, Medal } from 'lucide-react';
import api from '../../services/api';
import './statistics.css';

function Portrait({ entry }) {
  return entry.photo ? <img src={entry.photo} alt="" loading="lazy" className="statistics-portrait" />
    : <span className="statistics-portrait statistics-initial">{entry.player_name.slice(0, 1)}</span>;
}
function PlayerName({ entry }) {
  return entry.profile_available ? <Link to={'/players/' + entry.player_id}>{entry.player_name}</Link> : <span>{entry.player_name}</span>;
}

export default function Statistics() {
  const [params, setParams] = useSearchParams();
  const teamId = params.get('team_id') || '';
  const tab = params.get('tab') === 'saves' ? 'saves' : 'scorers';
  const [teams, setTeams] = useState([]);
  const [teamError, setTeamError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const key = teamId + ':' + refresh;
  const [state, setState] = useState({ key: '', data: null, error: '' });
  const loading = state.key !== key;
  const data = loading ? null : state.data;
  const entries = (tab === 'saves' ? data?.top_saves : data?.top_scorers) || [];
  const unit = tab === 'saves' ? 'saves' : 'gol';

  useEffect(() => {
    let active = true;
    api.get('/teams').then(({ data }) => { if (active) setTeams(data); })
      .catch(() => { if (active) setTeamError('Daftar filter klub gagal dimuat. Coba muat ulang halaman.'); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await api.get('/statistics', { params: teamId ? { team_id: teamId } : {} });
        if (active) setState({ key, data: response.data, error: '' });
      } catch {
        if (active) setState(previous => ({ key, data: previous.key === key ? previous.data : null,
          error: 'Statistik belum dapat dimuat. Silakan coba lagi.' }));
      }
    }
    load();
    const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [teamId, key]);

  function changeParam(name, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value); else next.delete(name);
    setParams(next);
  }

  return <div className="statistics-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <section className="statistics-hero">
      <div><span className="statistics-eyebrow">ANGKA DARI LAPANGAN</span><h1>Statistik KBMLeague</h1><p>Kenali pencetak gol dan penjaga gawang yang membuat perbedaan.</p></div>
      <Trophy size={56} aria-hidden="true" />
    </section>

    <div className="statistics-toolbar">
      <div className="statistics-tabs" role="group" aria-label="Jenis peringkat">
        <button type="button" aria-pressed={tab === 'scorers'} onClick={() => changeParam('tab', '')}><Goal size={18} /> Top Scorer</button>
        <button type="button" aria-pressed={tab === 'saves'} onClick={() => changeParam('tab', 'saves')}><Hand size={18} /> Top Saves</button>
      </div>
      <div className="statistics-tools"><label><span className="sr-only">Filter klub statistik</span><select aria-label="Filter klub statistik" value={teamId} onChange={e => changeParam('team_id', e.target.value)}><option value="">Semua klub</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
        <button type="button" className="statistics-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)} aria-label="Perbarui statistik"><RefreshCw size={18} /></button>
      </div>
    </div>
    {teamError && <p role="alert" className="text-amber-600 mb-4">{teamError}</p>}
    {!loading && state.error && <p role="alert" className="text-red-500 mb-5">{state.error}</p>}
    {loading && <p role="status" className="statistics-empty">Memuat statistik kompetisi...</p>}

    {data && <>
      <div className="statistics-summary">
        {[[CalendarDays, 'Pertandingan', data.summary.completed_matches], [Goal, teamId ? 'Gol klub' : 'Total gol', data.summary.total_goals], [Hand, 'Saves kiper tercatat', data.summary.recorded_saves]].map(([Icon, label, value]) =>
          <div key={label}><Icon size={21} /><span>{label}<strong>{value}</strong></span></div>)}
      </div>
      <div className="statistics-section-title"><div><span className="public-eyebrow">{tab === 'saves' ? 'PENJAGA GAWANG' : 'PENCETAK GOL'}</span><h2>{tab === 'saves' ? 'Penyelamatan terbanyak' : 'Gol terbanyak'}</h2></div><span>{entries.length} pemain</span></div>

      {entries.length > 0 ? <>
        <div className="statistics-podium">{entries.slice(0, 3).map((entry, index) => <article key={entry.player_id + ':' + entry.team?.id} className={'statistics-leader' + (index === 0 ? ' statistics-leader-first' : '')}>
          <span className="statistics-rank"><Medal size={17} /> #{entry.rank}</span><Portrait entry={entry} />
          <h3><PlayerName entry={entry} /></h3><p>{entry.team?.name || 'Klub tidak tersedia'}</p>
          <strong className="statistics-total">{entry.total}<small>{unit}</small></strong>
        </article>)}</div>

        <section className="statistics-table-section" aria-label="Daftar peringkat lengkap">
          <div className="statistics-table-scroll"><table><thead><tr><th>Peringkat</th><th>Pemain</th><th>Klub</th><th>{tab === 'saves' ? 'Saves' : 'Gol'}</th></tr></thead>
            <tbody>{entries.map(entry => <tr key={entry.player_id + ':' + entry.team?.id}><td className="statistics-table-rank">{entry.rank}</td><td><div className="statistics-table-player"><Portrait entry={entry} /><strong><PlayerName entry={entry} /></strong></div></td><td>{entry.team ? <Link to={'/teams/' + entry.team.id}>{entry.team.name}</Link> : 'Klub tidak tersedia'}</td><td className="statistics-table-total">{entry.total}</td></tr>)}</tbody>
          </table></div>
        </section>
      </> : <div className="statistics-empty"><Trophy size={36} /><h3>Belum ada {tab === 'saves' ? 'saves kiper' : 'gol pemain'} yang tercatat.</h3><p>Data muncul setelah admin mengisi rincian dan menyelesaikan pertandingan.</p><Link to="/fixtures">Lihat pertandingan <ArrowUpRight size={16} /></Link></div>}

    </>}
  </div>;
}
