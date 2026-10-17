import useFixtures from '../../hooks/useFixtures';
import MatchDetails from '../../components/MatchDetails';
import { Fragment } from 'react';
import PlayerCard from '../../components/PlayerCard';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const { fixtures: allFixtures } = useFixtures();
  const fixtures = allFixtures.filter(f => Number(f.home_team_id) === Number(id) || Number(f.away_team_id) === Number(id))
    .sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1) || new Date(b.match_date) - new Date(a.match_date));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/teams/${id}`), api.get('/players', { params: { team_id: id } })])
      .then(([resTeam, resPlayers]) => {
        if (!active) return;
        setTeam(resTeam.data);
        setSquad(resPlayers.data);
        setError(null);
      }).catch(() => { if (active) setError('Gagal memuat detail klub.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getMatchBadge = (fixture) => {
    if (fixture.status === 'live') return { label: 'LIVE', color: 'bg-primary/10 text-primary border-primary/20' };
    if (fixture.status !== 'completed') {
      return { label: 'SCHEDULED', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    const isHome = fixture.home_team_id === Number(id);
    const myScore = isHome ? fixture.home_score : fixture.away_score;
    const oppScore = isHome ? fixture.away_score : fixture.home_score;

    if (myScore > oppScore) {
      return { label: 'WIN', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (myScore < oppScore) {
      return { label: 'LOSE', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    }
    return { label: 'DRAW', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20' };
  };


  if (loading || (!error && team && String(team.id) !== id)) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Memuat portal klub...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-500 dark:text-red-400 mb-6 font-semibold">
          {error || 'Klub tidak ditemukan.'}
        </div>
        <Link to="/teams" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">
          <ArrowLeft size={16} /> Kembali ke Daftar Tim
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="mb-6">
        <Link to="/teams" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-colors">
          <ArrowLeft size={16} /> Kembali ke Daftar Tim
        </Link>
      </div>

      {/* Club Header Card */}
      <div className="public-detail-header bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs mb-12 transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200/60 dark:border-slate-700/60 object-cover shadow-sm shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-3xl shadow-xs shrink-0">
                {team.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold rounded-lg text-xs uppercase tracking-wider">
                Est. {team.founded_year || 'N/A'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight mt-2">{team.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">{team.description || 'Tidak ada deskripsi klub.'}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col items-end min-w-[160px] self-stretch md:self-auto transition-colors duration-300">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Skuad</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-primary">{squad.length}</span>
              <span className="text-sm font-bold text-slate-500">Pemain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Squad / Roster section */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Users className="text-primary" /> Skuad Pemain (Roster)
        </h2>
        {squad.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
            Belum ada pemain yang terdaftar di klub ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{squad.map(player => <PlayerCard key={player.id} player={player} />)}</div>
        )}
      </div>

      {/* Fixtures section */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Calendar className="text-primary" /> Riwayat & Jadwal Pertandingan Klub
        </h2>
        {fixtures.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
            Belum ada jadwal pertandingan untuk klub ini.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-850">
                  <tr>
                    <th className="py-4 px-6">Waktu & Venue</th>
                    <th className="py-4 px-6 text-center">Pertandingan</th>
                    <th className="py-4 px-6 text-center">Skor</th>
                    <th className="py-4 px-6 text-right">Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {fixtures.map((fixture) => {
                    const badge = getMatchBadge(fixture);
                    return (
                      <Fragment key={fixture.id}><tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800 dark:text-white">{formatDate(fixture.match_date)}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{fixture.venue || 'Stadion Utama'}</p>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-white">
                          <span className={fixture.home_team_id === Number(id) ? 'text-primary font-extrabold' : ''}>
                            {fixture.home_team?.name}
                          </span>
                          <span className="text-slate-400 font-normal px-3.5">vs</span>
                          <span className={fixture.away_team_id === Number(id) ? 'text-primary font-extrabold' : ''}>
                            {fixture.away_team?.name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-black text-amber-500 text-lg">
                          {fixture.status !== 'scheduled' ? `${fixture.home_score ?? 0} : ${fixture.away_score ?? 0}` : '- : -'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border uppercase tracking-wider inline-block ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                      {fixture.status !== 'scheduled' && <tr><td colSpan={4} className="px-6 pb-4"><MatchDetails fixture={fixture} /></td></tr>}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
