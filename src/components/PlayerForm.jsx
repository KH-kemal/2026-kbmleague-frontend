import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PlayerQr from './PlayerQr';
const empty = { team_id: '', name: '', photo: '', jersey_number: '', school_origin: '', birth_place_date: '', is_active: true };
export default function PlayerForm({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [created, setCreated] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([api.get('/teams'), editing ? api.get(`/players/${id}`) : Promise.resolve(null)]).then(([teamRes, playerRes]) => {
      if (!active) return;
      setTeams(teamRes.data);
      if (playerRes) { const data = playerRes.data; setForm(Object.fromEntries(Object.keys(empty).map(key => [key, key === 'is_active' ? Boolean(Number(data[key])) : data[key] ?? '']))); }
      else setForm({ ...empty, team_id: teamRes.data[0]?.id || '' });
    }).catch(() => { if (active) setError('Gagal memuat data. Silakan muat ulang halaman.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, editing]);
  function change(event) { const { name, value, type, checked } = event.target; setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value })); }
  async function upload(event) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file || uploading || saving) return;
    if (file.size > 3 * 1024 * 1024) { setError('Ukuran foto maksimal 3 MB.'); return; }
    const data = new FormData(); data.append('file', file); data.append('type', 'players');
    setUploading(true); setError('');
    try { const result = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }); setForm(current => ({ ...current, photo: result.data.url })); }
    catch (err) { setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || (err.response?.status === 413 ? 'Ukuran foto melebihi batas server. Gunakan foto maksimal 3 MB.' : '') || err.response?.data?.message || 'Upload gagal. Gunakan JPG, PNG, atau WebP maksimal 3 MB.'); }
    finally { setUploading(false); }
  }
  async function submit(event) {
    event.preventDefault(); if (uploading || saving) return; setSaving(true); setError('');
    try { const payload = { ...form, team_id: Number(form.team_id), jersey_number: Number(form.jersey_number) }; if (editing) { await api.put(`/players/${id}`, payload); navigate('/admin/players'); } else { const { data } = await api.post('/players', payload); setCreated(data); } }
    catch (err) { setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || err.response?.data?.message || 'Gagal menyimpan pemain.'); }
    finally { setSaving(false); }
  }
  if (created) return <section className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8"><h1>Pemain berhasil disimpan</h1><p className="mt-3 font-bold">{created.name}</p><p className="text-sm text-slate-500 mt-1">{created.team?.name} / #{created.jersey_number}</p><PlayerQr player={created} /><div className="mt-6 flex flex-wrap gap-4"><Link to="/admin/players" className="text-primary font-bold">Kembali ke pemain</Link><button type="button" className="text-primary font-bold" onClick={() => { setCreated(null); setForm({ ...empty, team_id: created.team_id }); }}>Tambah pemain lagi</button></div></section>;
  if (loading) return <p role="status">Memuat data pemain...</p>;
  return <div className="max-w-3xl mx-auto"><Link to="/admin/players" className="text-primary text-sm">Kembali ke pemain</Link><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mt-5"><h1>{editing ? 'Edit pemain' : 'Tambah pemain'}</h1><p className="text-sm text-slate-500 mt-2 mb-6">Lengkapi identitas, asal sekolah, dan tim pemain.</p>{error && <p role="alert" className="text-red-500 mb-5">{error}</p>}<form onSubmit={submit} className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><label className="grid gap-2">Nama pemain<input required maxLength={255} name="name" value={form.name} onChange={change} className="px-4 py-3" /></label><label className="grid gap-2">Tim<select required name="team_id" value={form.team_id} onChange={change} className="px-4 py-3"><option value="">Pilih tim</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label className="grid gap-2">Nomor punggung<input required type="number" name="jersey_number" value={form.jersey_number} onChange={change} className="px-4 py-3" /></label><label className="grid gap-2">Asal sekolah<input maxLength={255} name="school_origin" value={form.school_origin} onChange={change} placeholder="Contoh: SMA Negeri 1" className="px-4 py-3" /></label><label className="grid gap-2 sm:col-span-2">Tempat, tanggal lahir<input maxLength={255} name="birth_place_date" value={form.birth_place_date} onChange={change} placeholder="Contoh: Surabaya, 15 Mei 2008" className="px-4 py-3" /></label></div><label className="grid gap-2">Foto pemain<span className="text-sm text-slate-500">JPG, PNG, atau WebP maksimal 3 MB. Setelah mengganti foto, klik Simpan pemain.</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading || saving} className="p-3" /></label>{uploading && <p role="status">Mengunggah foto...</p>}{form.photo && <img src={form.photo} alt="Foto pemain" className="w-24 h-24 object-cover rounded-xl" />}<label className="flex items-center gap-2"><input type="checkbox" name="is_active" checked={form.is_active} onChange={change} /> Pemain aktif</label>{!teams.length && <p className="text-amber-600">Tambahkan tim terlebih dahulu sebelum menyimpan pemain.</p>}<div className="flex gap-4"><button disabled={saving || uploading || !teams.length} className="bg-primary text-white rounded-xl px-6 py-3">{saving ? 'Menyimpan...' : 'Simpan pemain'}</button><Link to="/admin/players" className="px-5 py-3">Batal</Link></div></form></div></div>;
}
