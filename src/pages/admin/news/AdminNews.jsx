import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUpRight, Newspaper } from 'lucide-react';
import api from '../../../services/api';
import AdminListTools from '../../../components/AdminListTools';
import NewsPagination from '../../../components/NewsPagination';
import { newsCategory, newsDate } from '../../../utils/news';
import '../../../components/news.css';

export default function AdminNews() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const key = JSON.stringify([search, page, reload]);
  const [state, setState] = useState({ key: '', data: [], total: 0, lastPage: 1, error: '' });
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      api.get('/news', { params: { page, per_page: 9, search } })
        .then(({ data }) => { if (active) setState({ key, data: data.data, total: data.total, lastPage: data.last_page, error: '' }); })
        .catch(() => { if (active) setState({ key, data: [], total: 0, lastPage: 1, error: 'Gagal memuat berita. Silakan muat ulang.' }); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, page, key]);
  async function remove(article) {
    if (busy || !window.confirm('Hapus berita "' + article.title + '"? Berita akan hilang dari website.')) return;
    setBusy(article.id); setDeleteError('');
    try {
      await api.delete('/news/' + article.id);
      if (state.data.length === 1 && page > 1) setPage(page - 1);
      setReload(value => value + 1);
    } catch { setDeleteError('Berita gagal dihapus. Silakan coba lagi.'); }
    finally { setBusy(null); }
  }
  return <div className="max-w-6xl mx-auto"><div className="flex flex-wrap justify-between items-center gap-4 mb-6"><div><h1 className="text-3xl font-black flex items-center gap-3"><Newspaper /> Kelola Berita</h1><p className="text-sm text-slate-500 mt-2">Berita yang disimpan langsung tampil di website.</p></div><Link className="news-admin-add" to="/admin/news/create"><Plus size={18} /> Tambah Berita</Link></div>
    <AdminListTools value={search} onChange={value => { setSearch(value); setPage(1); }} count={state.key === key ? state.data.length : 0} total={state.total} placeholder="Cari judul berita..." />
    {deleteError && <p role="alert" className="text-red-500 my-4">{deleteError}</p>}
    {state.key !== key ? <p role="status" className="news-empty">Memuat berita...</p> : state.error ? <p role="alert" className="news-empty">{state.error}</p> : <div className="space-y-4 mt-6">{state.data.map(article => <article className="news-admin-row" key={article.id}>
      <img src={article.cover_image} alt="" loading="lazy" /><div className="min-w-0 flex-1"><span className="news-category">{newsCategory(article.category)}</span><h2 className="font-bold mt-2 break-words">{article.title}</h2><p className="text-xs text-slate-500 mt-1">{newsDate((article.news_date || article.created_at))}</p></div>
      <div className="news-admin-actions"><Link to={'/news/' + article.id} aria-label={'Lihat ' + article.title}><ArrowUpRight size={18} /></Link><Link to={'/admin/news/' + article.id + '/edit'} aria-label={'Edit ' + article.title}><Pencil size={18} /></Link><button disabled={busy !== null} type="button" onClick={() => remove(article)} aria-label={'Hapus ' + article.title}><Trash2 size={18} /></button></div>
    </article>)}{!state.data.length && <p className="news-empty">Belum ada berita yang sesuai.</p>}</div>}
    {state.key === key && <NewsPagination page={page} lastPage={state.lastPage} onChange={setPage} />}
  </div>;
}
