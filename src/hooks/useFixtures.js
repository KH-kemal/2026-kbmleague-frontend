import { useEffect, useState } from 'react';
import api from '../services/api';

// Poll without overlapping requests; keep the last successful data on network errors.
export default function useFixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let pending = false;
    const controller = new AbortController();
    async function refresh() {
      if (pending) return;
      pending = true;
      try {
        const { data } = await api.get('/fixtures', { signal: controller.signal });
        if (active) { setFixtures(data); setError(''); }
      } catch { if (active) setError('Pembaruan pertandingan gagal. Mencoba kembali secara otomatis.'); }
      finally { pending = false; if (active) setLoading(false); }
    }
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { active = false; window.clearInterval(timer); controller.abort(); };
  }, []);
  return { fixtures, loading, error };
}
