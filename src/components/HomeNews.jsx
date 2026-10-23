import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import NewsCard from './NewsCard';

export default function HomeNews() {
  const [state, setState] = useState({ data: [], loading: true, error: '' });
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touchStart = useRef(null);
  const swiped = useRef(false);
  const count = state.data.length;
  function goTo(next) { setIndex((next + count) % count); }
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => setReducedMotion(media.matches);
    const visibilityChange = () => setHidden(document.hidden);
    media.addEventListener('change', motionChange);
    document.addEventListener('visibilitychange', visibilityChange);
    return () => { media.removeEventListener('change', motionChange); document.removeEventListener('visibilitychange', visibilityChange); };
  }, []);
  useEffect(() => {
    if (count < 2 || hovered || focused || hidden || reducedMotion) return;
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % count), 6000);
    return () => window.clearTimeout(timer);
  }, [index, count, hovered, focused, hidden, reducedMotion]);
  useEffect(() => {
    let active = true;
    api.get('/news', { params: { per_page: 3 } }).then(({ data }) => {
      if (active) setState({ data: data.data, loading: false, error: '' });
    }).catch(() => { if (active) setState({ data: [], loading: false, error: 'Kabar liga belum dapat dimuat. Silakan coba lagi nanti.' }); });
    return () => { active = false; };
  }, []);
  return <section className="home-news" aria-labelledby="home-news-title">
    <div className="home-section-heading"><div><span className="public-eyebrow">KABAR DARI LAPANGAN</span><h2 id="home-news-title">Kabar KBM League</h2></div><Link to="/news">Lihat semua berita <ArrowUpRight size={17} /></Link></div>
    {state.loading ? <p role="status" className="news-empty">Memuat kabar terbaru...</p>
      : state.error ? <p role="alert" className="news-empty">{state.error}</p>
      : state.data.length ? <div className="home-news-slider" role="region" aria-roledescription="karusel" aria-label="Berita terbaru"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
          onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); goTo(index + (event.key === 'ArrowLeft' ? -1 : 1)); } }}>
          <div className="home-news-stage" aria-live={focused ? 'polite' : 'off'}
            onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; swiped.current = false; }}
            onTouchEnd={event => { const start = touchStart.current; touchStart.current = null; if (!start || count < 2) return; const dx = event.changedTouches[0].clientX - start.x; const dy = event.changedTouches[0].clientY - start.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { swiped.current = true; goTo(index + (dx < 0 ? 1 : -1)); } }}
            onTouchCancel={() => { touchStart.current = null; }}
            onClickCapture={event => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }}>
            <div key={state.data[index].id} className="home-news-slide" role="group" aria-roledescription="slide" aria-label={(index + 1) + ' dari ' + count}><NewsCard article={state.data[index]} /></div>
          </div>
          {count > 1 && <div className="home-news-controls">
            <button type="button" className="home-news-arrow" aria-label="Berita sebelumnya" onClick={() => goTo(index - 1)}><ChevronLeft size={21} /></button>
            <div className="home-news-dots">{state.data.map((article, position) => <button key={article.id} type="button" aria-label={'Tampilkan berita ' + (position + 1) + ': ' + article.title} aria-current={position === index ? 'true' : undefined} onClick={() => goTo(position)}><span /></button>)}</div>
            <button type="button" className="home-news-arrow" aria-label="Berita berikutnya" onClick={() => goTo(index + 1)}><ChevronRight size={21} /></button>
          </div>}
        </div>
      : <div className="news-empty"><Newspaper size={28} /><p>Belum ada kabar terbaru. Informasi kompetisi akan tampil di sini.</p></div>}
  </section>;
}
