import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { MATCH_STATS, emptyStatistics } from '../../../utils/matchDetails';
import CardIcon from '../../../components/CardIcon';
import api from '../../../services/api';

const inputClass = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40';

export default function FixtureEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fixture, setFixture] = useState(null);
  const [players, setPlayers] = useState([]);
  const [rosterError, setRosterError] = useState('');
  const [form, setForm] = useState({ home_score: 0, away_score: 0, status: 'completed', goals: [], goalkeeper_saves: [], match_statistics: emptyStatistics() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    let active = true;
    api.get(`/fixtures/${id}`).then(async ({ data }) => {
      if (!active) return;
      setFixture(data);
      setForm({ home_score: data.home_score ?? 0, away_score: data.away_score ?? 0, status: data.status,
        goals: (data.goals || []).map(({ team_id, player_id, minute, added_time, player_name, type }) => ({ team_id, player_id, minute, added_time: added_time || '', player_name, type: type || 'regular' })),
        goalkeeper_saves: (data.goalkeeper_saves || []).map(entry => ({ ...entry })),
        match_statistics: emptyStatistics(data.match_statistics),
      });
      try {
        const responses = await Promise.all([api.get('/players', { params: { team_id: data.home_team_id } }), api.get('/players', { params: { team_id: data.away_team_id } })]);
        if (active) setPlayers(responses.flatMap(response => response.data));
      } catch { if (active) setRosterError('Daftar pemain gagal dimuat. Muat ulang halaman sebelum menambahkan gol atau saves kiper.'); }
    }).catch(() => { if (active) setError('Gagal memuat pertandingan. Silakan muat ulang halaman.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const updateGoal = (index, key, value) => setForm(previous => ({ ...previous, goals: previous.goals.map((goal, i) => i === index ? { ...goal, [key]: value, ...((key === 'team_id' || key === 'type') ? { player_id: '', player_name: '' } : {}) } : goal) }));
  const updateKeeper = (index, key, value) => setForm(previous => ({ ...previous,
    goalkeeper_saves: previous.goalkeeper_saves.map((entry, i) => i === index ? { ...entry, [key]: value, ...(key === 'team_id' ? { player_id: '', player_name: '' } : {}) } : entry),
  }));
  const submit = async event => {
    event.preventDefault();
    setSaving(true); setError(''); setSaved('');
    const statistics = Object.fromEntries(['home', 'away'].map(side => [side, Object.fromEntries(MATCH_STATS.map(({ key }) => [key, form.match_statistics[side][key] === '' ? null : Number(form.match_statistics[side][key])]))]));
    try {
      await api.put(`/fixtures/${id}`, { ...form, match_statistics: statistics, goals: form.goals.map(({ team_id, player_id, minute, added_time, type }) => ({ team_id: Number(team_id), player_id: Number(player_id), minute: Number(minute), added_time: added_time === '' ? 0 : Number(added_time), type: type || 'regular' })), goalkeeper_saves: form.goalkeeper_saves.map(({ team_id, player_id, saves }) => ({ team_id: Number(team_id), player_id: Number(player_id), saves: Number(saves) })) });
      if (form.status === 'completed') navigate('/admin/fixtures');
      else setSaved(form.status === 'live' ? 'Skor dan statistik LIVE tersimpan. Halaman penonton akan memperbarui otomatis.' : 'Data pertandingan terjadwal tersimpan.');
    } catch (err) { setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || err.response?.data?.message || 'Gagal menyimpan hasil pertandingan.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Memuat pertandingan...</div>;
  if (!fixture) return <div role="alert" className="p-8 text-red-500">{error}<Link to="/admin/fixtures" className="block mt-4 underline">Kembali ke jadwal</Link></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 dark:text-white">
      <Link to="/admin/fixtures" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-6"><ArrowLeft size={16} /> Kembali ke Kelola Jadwal</Link>
      <h1 className="text-3xl font-black mb-2">Hasil Pertandingan</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{fixture.venue || 'Lengkapi skor, pencetak gol, dan statistik kedua tim.'}</p>
      <form onSubmit={submit} className="space-y-6">
        {error && <div role="alert" className="rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 p-4">{error}</div>}
        {saved && <p role="status" className="rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4">{saved}</p>}
        <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
          <section className="rounded-3xl p-5 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end text-center">
              {['home', 'away'].map((side, index) => <div key={side} className={index === 1 ? 'col-start-3' : ''}>
                <label htmlFor={`${side}-score`} className="block font-extrabold mb-3">{fixture[`${side}_team`]?.name}</label>
                <input id={`${side}-score`} type="number" min="0" step="1" required value={form[`${side}_score`]} onChange={e => setForm({ ...form, [`${side}_score`]: e.target.value })} className={`${inputClass} text-center text-4xl font-black max-w-32`} />
              </div>)}
              <span aria-hidden="true" className="row-start-1 col-start-2 self-end pb-5 text-3xl font-black text-slate-400">:</span>
            </div>
            <label htmlFor="match-status" className="block text-sm font-bold mt-6 mb-2">Status pertandingan</label>
            <select id="match-status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}><option value="scheduled">Terjadwal / Belum Dimulai</option><option value="live">Berlangsung (LIVE)</option><option value="completed">Selesai (Full Time)</option></select>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Saat kick-off pilih Berlangsung lalu Simpan Hasil. Perbarui statistik selama laga, lalu pilih Selesai setelah peluit akhir.</p>
          </section>
          <section className="rounded-3xl p-5 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><h2 className="text-xl font-extrabold"><span role="img" aria-label="Bola">⚽</span> Pencetak Gol</h2>
              <button type="button" disabled={!!rosterError} onClick={() => setForm({ ...form, goals: [...form.goals, { team_id: fixture.home_team_id, player_id: '', minute: '', added_time: '', type: 'regular' }] })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold disabled:opacity-50"><Plus size={16} /> Tambah Gol</button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Pilih pemain dan menit gol. Contoh tambahan waktu: menit 45, tambahan 2 untuk 45+2′. Skor di atas diisi terpisah. Untuk gol bunuh diri, pilih tim penerima gol lalu pemain dari tim lawan. Adu penalti tidak dicatat di sini.</p>
            {rosterError && <p role="alert" className="text-amber-600 mb-3">{rosterError}</p>}
            {!form.goals.length && <p className="text-sm text-slate-400 py-4">Belum ada detail gol.</p>}
            <div className="space-y-4">{form.goals.map((goal, index) => {
              const rosterTeam = goal.type === 'own_goal'
                ? (Number(goal.team_id) === Number(fixture.home_team_id) ? fixture.away_team_id : fixture.home_team_id)
                : goal.team_id;
              const roster = players.filter(player => Number(player.team_id) === Number(rosterTeam));
              return <div key={index} className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1.5fr_5rem_5rem_auto] gap-3 items-end rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
                <label className="text-xs font-bold space-y-2"><span>Tim</span><select aria-label={`Tim gol ${index + 1}`} className={inputClass} value={goal.team_id} onChange={e => updateGoal(index, 'team_id', e.target.value)}><option value={fixture.home_team_id}>{fixture.home_team?.name}</option><option value={fixture.away_team_id}>{fixture.away_team?.name}</option></select></label>
                <label className="text-xs font-bold space-y-2"><span>Jenis gol</span><select aria-label={`Jenis gol ${index + 1}`} className={inputClass} value={goal.type || 'regular'} onChange={e => updateGoal(index, 'type', e.target.value)}><option value="regular">Gol biasa</option><option value="penalty">Penalti</option><option value="own_goal">Bunuh diri</option></select></label>
                <label className="text-xs font-bold space-y-2"><span>Pencetak gol</span><select required aria-label={`Pencetak gol ${index + 1}`} className={inputClass} value={goal.player_id} onChange={e => updateGoal(index, 'player_id', e.target.value)}><option value="">Pilih pemain</option>{goal.player_id && !roster.some(p => Number(p.id) === Number(goal.player_id)) && <option value={goal.player_id}>{goal.player_name || 'Pemain tersimpan'}</option>}{roster.map(player => <option key={player.id} value={player.id}>#{player.jersey_number} {player.name}</option>)}</select></label>
                <label className="text-xs font-bold space-y-2"><span>Menit</span><input required aria-label={`Menit gol ${index + 1}`} type="number" min="0" max="150" step="1" className={inputClass} value={goal.minute} onChange={e => updateGoal(index, 'minute', e.target.value)} /></label>
                <label className="text-xs font-bold space-y-2"><span>Tambahan</span><input aria-label={`Tambahan waktu gol ${index + 1}`} type="number" min="0" max="30" step="1" placeholder="0" className={inputClass} value={goal.added_time} onChange={e => updateGoal(index, 'added_time', e.target.value)} /></label>
                <button type="button" title="Hapus detail gol" aria-label={`Hapus gol ${index + 1}`} onClick={() => setForm({ ...form, goals: form.goals.filter((_, i) => i !== index) })} className="rounded-xl p-3 text-red-500 hover:bg-red-500/10 justify-self-end"><Trash2 size={18} /></button>
              </div>;
            })}</div>
          </section>
          <section className="rounded-3xl p-5 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-xl font-extrabold">Penyelamatan Kiper</h2>
              <button type="button" disabled={!!rosterError} onClick={() => setForm({ ...form, goalkeeper_saves: [...form.goalkeeper_saves, { team_id: fixture.home_team_id, player_id: '', saves: '' }] })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold disabled:opacity-50"><Plus size={16} /> Tambah Kiper</button>
            </div>
            <p className="text-sm text-slate-500 mb-5">Pilih kiper dan isi jumlah saves selama pertandingan. Bisa lebih dari satu kiper per tim. Total rincian tidak boleh melebihi saves tim di bawah. Saves adu penalti tidak dihitung. Top Saves diperbarui saat status Selesai.</p>
            {rosterError && <p role="alert" className="text-amber-600 mb-3">{rosterError}</p>}
            {!form.goalkeeper_saves.length && <p className="text-sm text-slate-400 py-4">Belum ada rincian saves kiper.</p>}
            <div className="space-y-4">{form.goalkeeper_saves.map((entry, index) => {
              const roster = players.filter(player => Number(player.team_id) === Number(entry.team_id));
              return <div key={index} className="grid grid-cols-2 md:grid-cols-[1fr_1.5fr_6rem_auto] gap-3 items-end rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
                <label className="text-xs font-bold space-y-2"><span>Tim kiper</span><select aria-label={`Tim kiper ${index + 1}`} className={inputClass} value={entry.team_id} onChange={e => updateKeeper(index, 'team_id', e.target.value)}><option value={fixture.home_team_id}>{fixture.home_team?.name}</option><option value={fixture.away_team_id}>{fixture.away_team?.name}</option></select></label>
                <label className="text-xs font-bold space-y-2"><span>Kiper</span><select required aria-label={`Kiper ${index + 1}`} className={inputClass} value={entry.player_id} onChange={e => updateKeeper(index, 'player_id', e.target.value)}><option value="">Pilih kiper</option>{entry.player_id && !roster.some(p => Number(p.id) === Number(entry.player_id)) && <option value={entry.player_id}>{entry.player_name || 'Kiper tersimpan'}</option>}{roster.map(player => <option key={player.id} value={player.id}>#{player.jersey_number} {player.name}</option>)}</select></label>
                <label className="text-xs font-bold space-y-2"><span>Jumlah saves</span><input required aria-label={`Saves kiper ${index + 1}`} type="number" min="0" max="999" step="1" value={entry.saves} onChange={e => updateKeeper(index, 'saves', e.target.value)} className={inputClass} /></label>
                <button type="button" aria-label={`Hapus kiper ${index + 1}`} onClick={() => setForm({ ...form, goalkeeper_saves: form.goalkeeper_saves.filter((_, i) => i !== index) })} className="rounded-xl p-3 text-red-500 hover:bg-red-500/10 justify-self-end"><Trash2 size={18} /></button>
              </div>;
            })}</div>
          </section>
          <section className="rounded-3xl p-5 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-extrabold mb-2">Statistik Pertandingan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Isi angka masing-masing tim secara manual. Possession cukup angka 0-100 tanpa tanda %. Kosongkan jika belum tersedia.</p>
            <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-3 text-center items-center font-bold text-xs sm:text-sm mb-3"><span>{fixture.home_team?.name}</span><span className="text-slate-400">STATISTIK</span><span>{fixture.away_team?.name}</span></div>
            {MATCH_STATS.map(stat => <div key={stat.key} className="grid grid-cols-[1fr_1.2fr_1fr] gap-3 items-center py-3 border-t border-slate-100 dark:border-slate-800">
              <input aria-label={`${stat.label} ${fixture.home_team?.name}`} type="number" min="0" max={stat.percent ? 100 : 999} step={stat.percent ? '0.1' : '1'} value={form.match_statistics.home[stat.key]} onChange={e => setForm({ ...form, match_statistics: { ...form.match_statistics, home: { ...form.match_statistics.home, [stat.key]: e.target.value } } })} placeholder="—" className={`${inputClass} text-center font-bold`} />
              <span className="flex justify-center items-center gap-2 text-xs sm:text-sm font-semibold">{stat.card && <CardIcon color={stat.card} />}{stat.label}{stat.percent ? ' (%)' : ''}</span>
              <input aria-label={`${stat.label} ${fixture.away_team?.name}`} type="number" min="0" max={stat.percent ? 100 : 999} step={stat.percent ? '0.1' : '1'} value={form.match_statistics.away[stat.key]} onChange={e => setForm({ ...form, match_statistics: { ...form.match_statistics, away: { ...form.match_statistics.away, [stat.key]: e.target.value } } })} placeholder="—" className={`${inputClass} text-center font-bold`} />
            </div>)}
          </section>
          <div className="flex justify-end gap-3"><Link to="/admin/fixtures" className="px-5 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800">Batal</Link><button type="submit" disabled={saving} className="inline-flex gap-2 items-center bg-primary text-white rounded-xl px-5 py-3 font-bold disabled:opacity-50"><Save size={18} />{saving ? 'Menyimpan...' : 'Simpan Hasil'}</button></div>
        </fieldset>
      </form>
    </div>
  );
}
