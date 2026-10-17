import BrandLogo from './BrandLogo';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, Users, CalendarDays, LogOut, Sun, Moon, Menu, X, QrCode, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
const menu = [
  { name: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
  { name: 'Tim & klub', path: 'teams', icon: Shield },
  { name: 'Pemain', path: 'players', icon: Users },
  { name: 'Pertandingan', path: 'fixtures', icon: CalendarDays },
  { name: 'Screening QR', path: 'screening', icon: QrCode },
];
export default function AdminSidebar({ theme, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  async function logout() {
    try { await api.post('/logout'); } catch (error) { console.error(error); }
    finally { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }
  }
  return <>
    <div className="admin-mobile-bar md:hidden"><Link to="/admin/dashboard" className="admin-mobile-brand"><BrandLogo /><span>KBMLeague / admin</span></Link><button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Buka navigasi" aria-expanded={mobileOpen}><Menu size={22} /></button></div>
    {mobileOpen && <button className="admin-backdrop md:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup navigasi" />}
    <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="flex items-center justify-between"><Link to="/admin/dashboard" className="admin-brand" onClick={() => setMobileOpen(false)}><BrandLogo /><span>KBMLeague<small>COMPETITION MANAGER</small></span></Link><button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup navigasi"><X size={20} /></button></div>
      <p className="admin-nav-label">WORKSPACE</p>
      <nav aria-label="Navigasi admin" className="admin-nav">{menu.map(({ name, path, icon: Icon }) => {
        const active = pathname.split('/')[2] === path;
        return <Link key={path} to={`/admin/${path}`} aria-current={active ? 'page' : undefined} className={active ? 'active' : ''} onClick={() => setMobileOpen(false)}><Icon size={19} /><span>{name}</span>{active && <span className="admin-active-dot" />}</Link>;
      })}</nav>
      <div className="admin-sidebar-note"><Shield size={20} /><strong>Di balik setiap laga hebat.</strong><p>Kelola tim, jadwal, dan identitas pemain dalam satu tempat.</p><Link to="/" onClick={() => setMobileOpen(false)}>Jelajahi kompetisi <ArrowUpRight size={15} /></Link></div>
      <div className="admin-sidebar-bottom"><button onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}</span></button><div className="admin-account"><div className="admin-avatar">{(user.name || 'A').slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><strong>{user.name || 'Administrator'}</strong><span>Administrator</span></div><button onClick={logout} title="Keluar" aria-label="Keluar dari akun"><LogOut size={18} /></button></div></div>
    </aside>
  </>;
}
