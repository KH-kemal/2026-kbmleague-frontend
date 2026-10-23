export default function NewsPagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null;
  return <nav className="news-pagination" aria-label="Halaman berita"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</button><span>Halaman {page} dari {lastPage}</span><button type="button" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>Berikutnya</button></nav>;
}
