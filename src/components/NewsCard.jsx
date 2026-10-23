import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Newspaper } from 'lucide-react';
import { newsCategory, newsDate } from '../utils/news';
import './news.css';

export default function NewsCard({ article }) {
  return <Link to={'/news/' + article.id} className="news-card">
    <div className="news-card-media"><Newspaper size={38} aria-hidden="true" /><img src={article.cover_image} alt={article.title} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} /></div>
    <div className="news-card-copy"><div className="news-card-meta"><span className="news-category">{newsCategory(article.category)}</span><time dateTime={(article.news_date || article.created_at)}><CalendarDays size={13} aria-hidden="true" />{newsDate((article.news_date || article.created_at))}</time></div>
      <h3>{article.title}</h3><p>{article.excerpt}</p><span className="news-read">Baca selengkapnya <ArrowUpRight size={16} aria-hidden="true" /></span>
    </div>
  </Link>;
}
