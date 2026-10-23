import BrandWordmark from './BrandWordmark';
import BrandLogo from './BrandLogo';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, ArrowUpRight, Search } from 'lucide-react';
import api from '../services/api';
const links = [['/', 'Beranda'], ['/teams', 'Klub & Pemain'], ['/fixtures', 'Jadwal & skor'], ['/statistics', 'Statistik'], ['/league-table', 'Klasemen']];
export default function Navbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdown = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  useEffect(() => {
    const close = event => { if (dropdown.current && !dropdown.current.contains(event.target)) setProfile(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); setProfile(false); } };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, []);
  async function logout() {
    try { await api.post('/logout'); } catch (error) { console.error(error); }
    finally { localStorage.removeItem('token'); localStorage.removeItem('user'); setProfile(false); setOpen(false); navigate('/'); }
  }
  const closeMenus = () => { setOpen(false); setProfile(false); };
  return <header className="public-header"><div className="public-nav-wrap">
    <Link to="/" className="public-brand" onClick={closeMenus}><BrandLogo /><BrandWordmark /></Link>
    <nav className="public-desktop-nav" aria-label="Navigasi utama">{links.map(([href, label]) => <NavLink key={href} to={href} end={href === '/'} className={({ isActive }) => isActive || (href === '/teams' && location.pathname.startsWith('/players/')) ? 'active' : undefined}>{label}</NavLink>)}</nav>
    <div className="public-nav-actions"><Link to="/teams#cari-klub-pemain" className="public-icon-button" aria-label="Cari klub atau pemain"><Search size={18} /></Link><button className="public-icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Gunakan mode terang' : 'Gunakan mode gelap'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
      {user ? <div className="public-profile" ref={dropdown}><button className="public-user" onClick={() => setProfile(!profile)} aria-expanded={profile} aria-label="Menu akun">{(user.name || 'U').slice(0, 1).toUpperCase()}</button>{profile && <div className="public-profile-menu"><strong>{user.name}</strong><small>{user.email}</small>{user.is_admin && <Link to="/admin/dashboard" onClick={closeMenus}>Panel admin <ArrowUpRight size={15} /></Link>}<button onClick={logout}><LogOut size={15} /> Keluar</button></div>}</div> : <Link to="/login" className="public-login">Masuk <ArrowUpRight size={14} /></Link>}
      <button className="public-mobile-toggle public-icon-button" onClick={() => setOpen(!open)} aria-label="Menu navigasi" aria-expanded={open}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
  </div>{open && <nav className="public-mobile-nav" aria-label="Navigasi mobile" key={location.pathname}>{links.map(([href, label]) => <NavLink key={href} to={href} end={href === '/'} onClick={closeMenus} className={({ isActive }) => isActive || (href === '/teams' && location.pathname.startsWith('/players/')) ? 'active' : undefined}>{label}</NavLink>)}</nav>}</header>;
}
