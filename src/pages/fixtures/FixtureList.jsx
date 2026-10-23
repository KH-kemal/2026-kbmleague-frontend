import { useState } from 'react';
import { Calendar } from 'lucide-react';
import FixtureCard from '../../components/FixtureCard';
import useFixtures from '../../hooks/useFixtures';

const GROUPS = [
  { status: 'live', title: 'Sedang Berlangsung', description: 'Skor dan statistik terbaru. Diperbarui otomatis setiap 15 detik.' },
  { status: 'scheduled', title: 'Pertandingan Mendatang', description: 'Jadwal kick-off dan tim yang akan bertanding.' },
  { status: 'completed', title: 'Hasil Pertandingan', description: 'Buka detail pertandingan untuk melihat gol dan statistik.' },
];

export default function FixtureList() {
  const { fixtures, loading, error } = useFixtures();
  const [statusFilter, setStatusFilter] = useState('');
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="public-page-intro flex flex-wrap items-center justify-between gap-5 mb-8">
      <div><h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Calendar className="text-primary shrink-0" /> Jadwal & Hasil Pertandingan</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Ikuti laga berlangsung, jadwal berikutnya, dan hasil akhir.</p></div>
      <select aria-label="Filter status pertandingan" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-white"><option value="">Semua Status</option><option value="live">Berlangsung</option><option value="scheduled">Terjadwal</option><option value="completed">Selesai</option></select>
    </div>
    {error && <p role="alert" className="text-amber-600 dark:text-amber-400 mb-6">{error}</p>}
    {loading ? <p role="status" className="text-center py-16 text-slate-500">Memuat pertandingan...</p> : <div className="space-y-10">{GROUPS.filter(group => !statusFilter || group.status === statusFilter).map(group => {
      const matches = fixtures.filter(match => match.status === group.status).sort((a, b) => group.status === 'completed' ? new Date(b.match_date) - new Date(a.match_date) : new Date(a.match_date) - new Date(b.match_date));
      return <section key={group.status} aria-label={group.title}>
        <div className="mb-4"><h2 className="text-xl font-black text-slate-800 dark:text-white">{group.title} <span className="text-sm text-slate-400 ml-2">{matches.length} laga</span></h2><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.description}</p></div>
        <div className={group.status === 'scheduled' && matches.length ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>{matches.length ? matches.map(fixture => <FixtureCard key={fixture.id} fixture={fixture} />) : <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-slate-500 text-sm">Belum ada pertandingan {group.status === 'live' ? 'yang sedang berlangsung' : group.status === 'scheduled' ? 'mendatang' : 'selesai'}.</p>}</div>
      </section>;
    })}</div>}
  </div>;
}
