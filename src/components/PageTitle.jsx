import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const sections = {
  teams: 'Klub & Pemain', players: 'Pemain', fixtures: 'Jadwal & Skor',
  'league-table': 'Klasemen', statistics: 'Statistik', news: 'Berita',
  dashboard: 'Dashboard', screening: 'Screening QR',
  login: 'Masuk', register: 'Daftar Akun',
};

export default function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean);
    const admin = parts[0] === 'admin';
    const section = sections[parts[admin ? 1 : 0]] || (admin ? 'Dashboard' : 'Beranda');
    const action = parts.at(-1) === 'create' ? 'Tambah' : parts.at(-1) === 'edit' ? 'Edit' : parts.at(-1) === 'import' ? 'Import' : '';
    document.title = `${action ? `${action} ` : ''}${section}${admin ? ' Admin' : ''} | KBMLeague`;
  }, [pathname]);
  return null;
}
