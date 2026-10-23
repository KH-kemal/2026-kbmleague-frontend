import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy, Users, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import DirectorySearch from '../../components/DirectorySearch';
import PlayerCard from '../../components/PlayerCard';

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [params] = useSearchParams();
  const query = (params.get('search') || '').trim();
  const normal = value => String(value || '').trim().toLocaleLowerCase('id-ID');
  const search = normal(query);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.get('/teams'), api.get('/players')]).then(([teamResult, playerResult]) => {
      if (!active) return;
      if (teamResult.status === 'fulfilled') setTeams(teamResult.value.data);
      else setError('Gagal memuat klub. Silakan muat ulang halaman.');
      if (playerResult.status === 'fulfilled') setPlayers(playerResult.value.data);
      else setPlayerError('Pencarian pemain belum dapat dimuat. Pencarian nama klub tetap tersedia.');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const matchedPlayers = search ? players.filter(player =>
    normal(player.name).includes(search) || normal(player.team?.name).includes(search)
  ) : [];
  const matchedTeamIds = new Set(matchedPlayers.map(player => String(player.team_id)));
  const visibleTeams = search ? teams.filter(team =>
    normal(team.name).includes(search) || matchedTeamIds.has(String(team.id))
  ) : teams;

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="public-page-intro flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div><h1 className="text-3xl font-black flex items-center gap-3"><Trophy className="text-primary" /> Klub &amp; Pemain</h1>
        <p className="text-sm text-slate-500 mt-2">Kenali klub peserta KBMLeague dan temukan pemain melalui skuad masing-masing klub.</p></div>
      {!loading && !error && <span className="text-sm font-semibold whitespace-nowrap">{teams.length} klub terdaftar</span>}
    </div>

    <DirectorySearch initialValue={query} />
    {query && <div className="flex flex-wrap items-center gap-3 text-sm mt-4 mb-6">
      <span>Hasil pencarian: <strong>{query}</strong></span><Link className="text-primary underline" to="/teams">Hapus pencarian</Link>
    </div>}
    {loading && <p role="status" className="py-12 text-center text-slate-500">Memuat klub dan pemain...</p>}
    {error && <p role="alert" className="text-red-500 py-6">{error}</p>}
    {!loading && playerError && <p role="alert" className="text-amber-600 my-5">{playerError}</p>}

    {!loading && !error && <>
      <section className="mt-8" aria-labelledby="club-results-title">
        <h2 id="club-results-title" className="text-xl font-bold mb-5">{search ? 'Klub terkait (' + visibleTeams.length + ')' : 'Daftar klub'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTeams.map(team => <Link key={team.id} to={'/teams/' + team.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-primary transition-colors group">
            <div className="flex items-center gap-4">
              {team.logo ? <img src={team.logo} alt="" loading="lazy" className="w-16 h-16 rounded-2xl object-contain" />
                : <span className="w-16 h-16 shrink-0 rounded-2xl bg-primary/10 text-primary grid place-items-center font-black text-xl">{team.name.slice(0, 2).toUpperCase()}</span>}
              <h3 className="text-xl font-bold break-words">{team.name}</h3>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-slate-500"><Users size={16} />{team.players_count || 0} pemain</span>
              <span className="flex items-center gap-1 font-semibold text-primary">Lihat skuad <ArrowUpRight size={16} /></span>
            </div>
          </Link>)}
        </div>
        {!visibleTeams.length && <p className="py-10 text-center text-slate-500">{search ? 'Tidak ada klub yang sesuai dengan pencarian.' : 'Belum ada klub terdaftar.'}</p>}
      </section>

      {search && !playerError && <section className="mt-10" aria-labelledby="player-results-title">
        <h2 id="player-results-title" className="text-xl font-bold mb-5">Pemain ditemukan ({matchedPlayers.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{matchedPlayers.map(player => <PlayerCard key={player.id} player={player} />)}</div>
        {!matchedPlayers.length && <p className="py-10 text-center text-slate-500">Tidak ada pemain yang sesuai dengan pencarian.</p>}
      </section>}
    </>}
  </div>;
}
