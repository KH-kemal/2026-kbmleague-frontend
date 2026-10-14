import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { PlayerIdentity } from '../../components/PlayerCard';
export default function PlayerDetail() {
  const { id } = useParams(); const [player, setPlayer] = useState(null); const [error, setError] = useState('');
  useEffect(() => { let active = true; api.get(`/players/${id}`).then(({ data }) => { if (active) setPlayer(data); }).catch(() => { if (active) setError('Pemain tidak ditemukan atau gagal dimuat.'); }); return () => { active = false; }; }, [id]);
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12" key={id}><Link to="/players" className="text-primary text-sm">Kembali ke daftar pemain</Link>{error ? <p role="alert" className="text-red-500 mt-6">{error}</p> : !player || String(player.id) !== id ? <p className="mt-6" role="status">Memuat profil...</p> : <div className="public-detail-header bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6"><PlayerIdentity player={player} /><Link to={`/teams/${player.team_id}`} className="inline-block text-primary mt-6">Lihat profil tim</Link></div>}</div>;
}
