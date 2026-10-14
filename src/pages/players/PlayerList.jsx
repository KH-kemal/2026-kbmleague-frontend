import { useEffect, useState } from 'react';
import api from '../../services/api';
import PlayerCard from '../../components/PlayerCard';
export default function PlayerList() {
  const [players, setPlayers] = useState([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let active = true; api.get('/players').then(({ data }) => { if (active) setPlayers(data); }).catch(() => { if (active) setError('Gagal memuat pemain. Silakan muat ulang.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const filtered = players.filter(player => [player.name, player.team?.name, player.school_origin].join(' ').toLowerCase().includes(search.toLowerCase().trim()));
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="public-page-intro mb-8"><h1>Kenali para pemain.</h1><p className="text-sm text-slate-500 mt-2">Identitas, sekolah asal, dan tim peserta KBMLeague.</p></div><label className="block mb-6"><span className="sr-only">Cari pemain, tim, atau sekolah</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari nama, tim, atau sekolah..." className="w-full max-w-md px-4 py-3 border rounded-xl" /></label>{error && <p role="alert" className="text-red-500">{error}</p>}{loading ? <p role="status">Memuat pemain...</p> : !error && <><p className="text-sm text-slate-500 mb-5">{filtered.length} pemain</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(player => <PlayerCard key={player.id} player={player} />)}</div>{!filtered.length && <p className="py-12 text-center">Belum ada pemain yang sesuai.</p>}</>}</div>;
}
