import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsGallery({ article }) {
  const images = article.images?.length ? article.images : [article.cover_image];
  const [index, setIndex] = useState(0);
  const start = useRef(null);
  const go = next => setIndex((next + images.length) % images.length);
  return <section className="news-gallery" aria-label="Galeri gambar berita" aria-roledescription="karusel" onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); go(index + (event.key === 'ArrowLeft' ? -1 : 1)); } }}>
    <div className="news-gallery-frame" onTouchStart={event => { start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchCancel={() => { start.current = null; }} onTouchEnd={event => { const point = start.current; start.current = null; if (!point) return; const dx = event.changedTouches[0].clientX - point.x; const dy = event.changedTouches[0].clientY - point.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1)); }}>
      <img className="news-detail-cover" src={images[index]} alt={article.title + ' - gambar ' + (index + 1)} />
    </div>
    {images.length > 1 && <div className="home-news-controls"><button type="button" className="home-news-arrow" aria-label="Gambar sebelumnya" onClick={() => go(index - 1)}><ChevronLeft size={20} /></button><div className="home-news-dots">{images.map((url, i) => <button type="button" key={url} aria-label={'Tampilkan gambar ' + (i + 1)} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)}><span /></button>)}</div><button type="button" className="home-news-arrow" aria-label="Gambar berikutnya" onClick={() => go(index + 1)}><ChevronRight size={20} /></button><span className="news-gallery-count" aria-live="polite">{index + 1} / {images.length}</span></div>}
  </section>;
}
