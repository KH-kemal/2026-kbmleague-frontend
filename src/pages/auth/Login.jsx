import BrandLogo from '../../components/BrandLogo';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
export default function Login() {
 const navigate = useNavigate();
 const [form, setForm] = useState({ email: '', password: '' });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 async function submit(event) {
  event.preventDefault(); setLoading(true); setError('');
  try {
   const { data } = await api.post('/login', form);
   localStorage.setItem('token', data.token);
   localStorage.setItem('user', JSON.stringify(data.user));
   navigate(data.user.is_admin ? '/admin/dashboard' : '/');
  } catch (err) { setError(err.response?.data?.message || 'Permintaan gagal. Silakan coba lagi.'); }
  finally { setLoading(false); }
 }
 return <main className="auth-shell"><div className="auth-card">
  <Link to="/" className="auth-brand"><BrandLogo /><span>KBMLeague</span></Link>
  <p className="eyebrow">PORTAL SEPAK BOLA</p><h1>Selamat datang kembali</h1><p className="auth-intro">Masuk untuk melanjutkan pengelolaan kompetisi.</p>
  <form onSubmit={submit} className="auth-form"><label>Email<input type="email" required minLength={1} value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label><label>Kata sandi<input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></label>
   {error && <p role="alert" className="auth-error">{error}</p>}
   <button disabled={loading} className="auth-submit">{loading ? 'Memproses...' : 'Masuk'}</button>
  </form><p className="auth-switch">Belum punya akun? <Link to="/register">Daftar</Link></p>
 </div></main>;
}

