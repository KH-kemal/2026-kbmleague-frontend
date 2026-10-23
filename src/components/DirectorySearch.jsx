import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DirectorySearch({ initialValue = '', id = 'cari-klub-pemain' }) {
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('search') || '').trim();
    navigate(query ? '/teams?search=' + encodeURIComponent(query) : '/teams');
  }

  return <form id={id} className="directory-search" role="search" aria-label="Cari klub atau pemain" onSubmit={submit}>
    <label className="directory-search-input">
      <Search size={20} aria-hidden="true" />
      <span className="sr-only">Nama klub atau pemain</span>
      <input key={initialValue} name="search" type="search" defaultValue={initialValue} placeholder="Cari nama klub atau pemain..." maxLength={255} />
    </label>
    <button type="submit"><Search size={17} aria-hidden="true" /> Cari</button>
  </form>;
}
