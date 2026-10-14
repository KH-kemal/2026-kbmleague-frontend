import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../../services/api';
import { PlayerIdentity } from '../../../components/PlayerCard';
export default function AdminScreening() {
  const readerRef = useRef(null); const generation = useRef(0);
  const [scanning, setScanning] = useState(false); const [player, setPlayer] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => () => { generation.current += 1; }, []);
  useEffect(() => {
    if (!scanning) return;
    const run = ++generation.current;
    const scanner = new Html5Qrcode('player-qr-reader'); readerRef.current = scanner;
    let active = true; let detected = false;
    const started = scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 230 }, token => {
      if (!active || detected) return; detected = true;
      setLoading(true); setScanning(false);
      api.get(`/players/by-qr/${encodeURIComponent(token)}`).then(({ data }) => { if (generation.current === run) setPlayer(data); }).catch(err => { if (generation.current === run) setError(err.response?.data?.message || 'Gagal memuat pemain.'); }).finally(() => { if (generation.current === run) setLoading(false); });
    }).catch(() => { if (active) { setError('Kamera gagal dibuka. Periksa izin kamera dan gunakan HTTPS atau localhost.'); setScanning(false); } });
    return () => { active = false; started.then(async () => { if (scanner.isScanning) await scanner.stop(); scanner.clear(); }).catch(() => {}); readerRef.current = null; };
  }, [scanning]);
  function start() { if (readerRef.current) return; setPlayer(null); setError(''); setScanning(true); }
  return <div className="max-w-4xl mx-auto"><h1>Screening pemain</h1><p className="text-sm text-slate-500 mt-2 mb-6">Pindai kartu untuk memeriksa identitas dan asal sekolah pemain.</p>{error && <p role="alert" className="text-red-500 mb-5">{error}</p>}<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6"><div id="player-qr-reader" className={scanning ? 'mb-5' : 'hidden'} />{loading && <p role="status">Mencari pemain...</p>}{player && <PlayerIdentity player={player} />}{!scanning && !loading && <button className="bg-primary text-white rounded-xl px-6 py-3 mt-5" onClick={start}>{player ? 'Pindai pemain berikutnya' : 'Mulai pemindaian'}</button>}{scanning && <button onClick={() => setScanning(false)} className="text-primary">Hentikan kamera</button>}</div></div>;
}
