import BrandLogo from '../../components/BrandLogo';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
export default function Register() {
 const navigate = useNavigate();
 const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 async function submit(event) {
  event.preventDefault(); setLoading(true); setError('');
  try {
   const { data } = await api.post('/register', form);
   localStorage.setItem('token', data.token);
   localStorage.setItem('user', JSON.stringify(data.user));
   navigate(data.user.is_admin ? '/admin/dashboard' : '/');
  } catch (err) { setError(err.response?.data?.message || 'Permintaan gagal. Silakan coba lagi.'); }
  finally { setLoading(false); }
 }
 return <main className="auth-shell"><div className="auth-card">
  <Link to="/" className="auth-brand"><BrandLogo /><span>KBMLeague</span></Link>
  <p className="eyebrow">PORTAL SEPAK BOLA</p><h1>Buat akun</h1><p className="auth-intro">Daftar untuk mengikuti tim, pemain, dan kompetisi.</p>
  <form onSubmit={submit} className="auth-form"><label>Nama lengkap<input type="text" required minLength={1} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></label><label>Email<input type="email" required minLength={1} value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label><label>Kata sandi<input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></label><label>Konfirmasi kata sandi<input type="password" required minLength={8} value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} /></label>
   {error && <p role="alert" className="auth-error">{error}</p>}
   <button disabled={loading} className="auth-submit">{loading ? 'Memproses...' : 'Daftar'}</button>
  </form><p className="auth-switch">Sudah punya akun? <Link to="/login">Masuk</Link></p>
 </div></main>;
}

