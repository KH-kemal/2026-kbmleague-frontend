import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';
const sections = { dashboard: 'Dashboard', teams: 'Tim & klub', players: 'Pemain', fixtures: 'Pertandingan', screening: 'Screening pemain' };
export default function AdminLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);
  return <div className="admin-shell min-h-screen flex flex-col md:flex-row">
    <AdminSidebar theme={theme} toggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} />
    <div className="flex-1 min-w-0 flex flex-col">
      <header className="admin-topbar"><div className="admin-breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{sections[pathname.split('/')[2]] || 'Dashboard'}</strong>{pathname.endsWith('/create') && <><ChevronRight size={14} /><span>Tambah data</span></>}{pathname.endsWith('/edit') && <><ChevronRight size={14} /><span>Edit data</span></>}</div><div className="flex items-center gap-4"><Link to="/" className="admin-public-link">Lihat website <ArrowUpRight size={15} /></Link><div className="admin-avatar" title={user.name}>{(user.name || 'A').slice(0, 1).toUpperCase()}</div></div></header>
      <main className="admin-content flex-1" key={pathname}><Outlet /></main>
      <footer className="admin-footer"><span>© {new Date().getFullYear()} KBMLeague</span><span>Ruang pengelolaan kompetisi</span></footer>
    </div>
  </div>;
}
