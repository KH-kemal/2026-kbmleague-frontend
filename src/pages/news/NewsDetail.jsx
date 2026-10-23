import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import NewsGallery from '../../components/NewsGallery';
import api from '../../services/api';
import { newsCategory, newsDate } from '../../utils/news';
import '../../components/news.css';

export default function NewsDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ id: '', article: null, error: '' });
  useEffect(() => {
    let active = true;
    api.get('/news/' + id).then(({ data }) => {
      if (active) { setState({ id, article: data, error: '' }); document.title = data.title + ' | KBMLeague'; }
    }).catch(() => { if (active) setState({ id, article: null, error: 'Berita tidak ditemukan atau belum dapat dimuat.' }); });
    return () => { active = false; };
  }, [id]);
  const article = state.id === id ? state.article : null;
  return <div className="news-detail max-w-5xl mx-auto px-4 sm:px-6 py-12"><Link className="news-back" to="/news"><ArrowLeft size={16} /> Kembali ke berita</Link>
    {state.id !== id ? <p role="status" className="news-empty">Memuat berita...</p> : state.error ? <p role="alert" className="news-empty">{state.error}</p> : article && <article>
      <div className="news-detail-heading"><div className="news-card-meta"><span className="news-category">{newsCategory(article.category)}</span><time dateTime={(article.news_date || article.created_at)}><CalendarDays size={14} />{newsDate((article.news_date || article.created_at))}</time></div>
        <h1>{article.title}</h1><p>{article.excerpt}</p></div>
      <NewsGallery key={article.id} article={article} />
      <div className="news-detail-content">{article.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    </article>}
  </div>;
}
