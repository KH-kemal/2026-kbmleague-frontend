import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import api from '../../services/api';
import NewsCard from '../../components/NewsCard';
import NewsPagination from '../../components/NewsPagination';
import { NEWS_CATEGORIES } from '../../utils/news';

export default function NewsList() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const key = category + ':' + page;
  const [state, setState] = useState({ key: '', data: [], lastPage: 1, error: '' });
  useEffect(() => {
    let active = true;
    api.get('/news', { params: { page, per_page: 9, ...(category ? { category } : {}) } })
      .then(({ data }) => { if (active) setState({ key, data: data.data, lastPage: data.last_page, error: '' }); })
      .catch(() => { if (active) setState({ key, data: [], lastPage: 1, error: 'Berita belum dapat dimuat. Silakan muat ulang halaman.' }); });
    return () => { active = false; };
  }, [category, page, key]);
  function change(name, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value); else next.delete(name);
    if (name === 'category') next.delete('page');
    setParams(next);
  }
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="public-page-intro flex flex-wrap justify-between items-center gap-5 mb-8"><div><h1 className="text-3xl font-black flex items-center gap-3"><Newspaper /> Kabar KBM League</h1><p className="text-sm text-slate-500 mt-2">Cerita pertandingan, kegiatan, dan pengumuman kompetisi.</p></div>
      <label><span className="sr-only">Kategori berita</span><select aria-label="Kategori berita" value={category} onChange={e => change('category', e.target.value)} className="border rounded-xl px-4 py-3"><option value="">Semua kategori</option>{NEWS_CATEGORIES.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label></div>
    {state.key !== key ? <p role="status" className="news-empty">Memuat berita...</p> : state.error ? <p role="alert" className="news-empty">{state.error}</p>
      : <>{state.data.length ? <div className="news-card-list">{state.data.map(article => <NewsCard article={article} key={article.id} />)}</div> : <p className="news-empty">Belum ada berita untuk kategori ini.</p>}<NewsPagination page={page} lastPage={state.lastPage} onChange={value => change('page', value)} /></>}
  </div>;
}
