import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import api from '../../../services/api';
import { NEWS_CATEGORIES } from '../../../utils/news';
import '../../../components/news.css';

const empty = { title: '', excerpt: '', category: 'pertandingan', content: '', cover_image: '', news_date: '', images: [] };
export default function NewsForm({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loaded, setLoaded] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (!editing) return;
    let active = true;
    api.get('/news/' + id).then(({ data }) => {
      if (active) { setForm(Object.fromEntries(Object.keys(empty).map(key => [key, key === 'images' ? (data.images?.length ? data.images : data.cover_image ? [data.cover_image] : []) : key === 'news_date' ? (data.news_date || data.created_at?.slice(0, 10) || '') : (data[key] ?? '')]))); setLoaded(id); }
    }).catch(() => { if (active) { setError('Berita gagal dimuat. Silakan kembali ke daftar berita.'); setLoaded(id); } });
    return () => { active = false; };
  }, [id, editing]);
  function change(event) { const { name, value } = event.target; setForm(current => ({ ...current, [name]: value })); }
  async function upload(event) {
    const files = Array.from(event.target.files || []); event.target.value = '';
    if (!files.length || uploading || saving) return;
    if (form.images.length + files.length > 3) { setError('Maksimal 3 gambar per berita. Hapus gambar lama sebelum menambah yang baru.'); return; }
    if (files.some(file => file.size > 3 * 1024 * 1024)) { setError('Setiap gambar maksimal 3 MB.'); return; }
    if (files.some(file => file.type && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { setError('Gunakan gambar JPG, PNG, atau WebP.'); return; }
    setUploading(true); setError('');
    try {
      for (const file of files) {
        const payload = new FormData(); payload.append('file', file); payload.append('type', 'news');
        const { data } = await api.post('/upload', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        setForm(current => { const images = [...current.images, data.url]; return { ...current, images, cover_image: images[0] }; });
      }
    } catch (err) { setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || 'Sebagian gambar gagal diunggah. Gambar yang sudah tampil tetap tersimpan di form; pilih ulang hanya gambar yang gagal.'); }
    finally { setUploading(false); }
  }
  function removeImage(index) {
    setForm(current => { const images = current.images.filter((_, i) => i !== index); return { ...current, images, cover_image: images[0] || '' }; });
  }
  function setCover(index) {
    setForm(current => { const images = [current.images[index], ...current.images.filter((_, i) => i !== index)]; return { ...current, images, cover_image: images[0] }; });
  }

  async function submit(event) {
    event.preventDefault();
    if (uploading || saving) return;
    if (!form.cover_image) { setError('Unggah gambar sampul terlebih dahulu.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await api.put('/news/' + id, form); else await api.post('/news', form);
      navigate('/admin/news');
    } catch (err) { setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || err.response?.data?.message || 'Berita gagal disimpan.'); }
    finally { setSaving(false); }
  }
  if (editing && loaded !== id) return <p role="status">Memuat berita...</p>;
  return <div className="max-w-4xl mx-auto"><Link to="/admin/news" className="news-back"><ArrowLeft size={16} /> Kembali ke berita</Link><section className="news-form-panel"><h1 className="text-3xl font-black">{editing ? 'Edit Berita' : 'Tambah Berita'}</h1><p className="text-sm text-slate-500 mt-2 mb-6">Setelah disimpan, berita langsung tampil di website.</p>
    {error && <p role="alert" className="text-red-500 mb-5">{error}</p>}
    <form onSubmit={submit}><fieldset disabled={saving || uploading} className="news-form-fields">
      <label>Judul berita<input name="title" value={form.title} onChange={change} required maxLength={180} placeholder="Tulis judul berita..." /></label>
      <label>Kategori<select name="category" value={form.category} onChange={change}>{NEWS_CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label>Tanggal berita<input type="date" name="news_date" value={form.news_date} onChange={change} required /><span className="text-sm text-slate-500">Tanggal ini ditampilkan pada berita dan menentukan urutan berita terbaru.</span></label>
      <label>Gambar berita ({form.images.length}/3)<span className="text-sm text-slate-500">Maksimal 3 foto, masing-masing 3 MB (JPG, PNG, WebP). Disarankan rasio 4:5. Foto pertama menjadi sampul.</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={form.images.length >= 3} /></label>
      {uploading && <p role="status">Mengunggah gambar...</p>}
      {form.images.length ? <div className="news-form-gallery">{form.images.map((url, index) => <div key={url} className="news-form-gallery-item"><img src={url} alt={'Gambar berita ' + (index + 1)} className="news-form-cover" /><div className="news-form-gallery-actions">{index === 0 ? <span className="news-category">Sampul</span> : <button type="button" onClick={() => setCover(index)}>Jadikan sampul</button>}<button type="button" onClick={() => removeImage(index)} aria-label={'Hapus gambar ' + (index + 1)}>Hapus</button></div></div>)}</div> : <div className="news-form-placeholder"><ImagePlus size={30} /><span>Pilih gambar untuk berita.</span></div>}
      <label>Ringkasan<textarea name="excerpt" rows={3} value={form.excerpt} onChange={change} required maxLength={500} placeholder="Deskripsi singkat yang tampil pada kartu berita..." /></label>
      <label>Isi berita<textarea name="content" rows={12} value={form.content} onChange={change} required maxLength={50000} placeholder="Tulis berita lengkap. Pisahkan paragraf dengan baris kosong." /></label>
      <div className="flex justify-end gap-3"><Link to="/admin/news" className="px-5 py-3">Batal</Link><button className="news-admin-add" type="submit" disabled={saving || uploading}><Save size={17} />{saving ? 'Menyimpan...' : 'Simpan Berita'}</button></div>
    </fieldset></form>
  </section></div>;
}
