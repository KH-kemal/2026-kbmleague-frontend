import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import api from '../../../services/api';

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const labels = { ready: 'Siap', error: 'Perlu diperbaiki', duplicate: 'Dilewati', created: 'Tersimpan', failed: 'Gagal', processing: 'Memproses' };
export default function PlayerImport() {
  const [file, setFile] = useState(null), [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false), [zipping, setZipping] = useState(false);
  const [error, setError] = useState(''), [players, setPlayers] = useState([]);
  const ready = rows.filter(r => ['ready', 'failed'].includes(r.status));
  const message = e => Object.values(e.response?.data?.errors || {}).flat().join(' ') || e.response?.data?.message || 'Koneksi gagal. Silakan coba lagi.';
  function template() {
    download(new Blob(['\uFEFFname,birth_place_date,school_origin,team_name,jersey_number,photo_url\r\n'], { type: 'text/csv;charset=utf-8' }), 'template-pemain.csv');
  }
  async function preview() {
    if (!file) return;
    setBusy(true); setError(''); setRows([]); setPlayers([]);
    try {
      const form = new FormData(); form.append('file', file);
      const { data } = await api.post('/player-import/preview', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRows(data.rows);
    } catch (e) { setError(message(e)); } finally { setBusy(false); }
  }
  async function run() {
    setBusy(true); setError('');
    for (const row of ready) {
      setRows(current => current.map(r => r.line === row.line ? { ...r, status: 'processing' } : r));
      try {
        const { data } = await api.post('/player-import/commit', { ticket: row.ticket });
        if (data.player) setPlayers(current => [...current.filter(p => p.id !== data.player.id), data.player]);
        setRows(current => current.map(r => r.line === row.line ? { ...r, status: data.status, message: data.message || 'Pemain, foto, dan QR tersimpan.' } : r));
      } catch (e) {
        setRows(current => current.map(r => r.line === row.line ? { ...r, status: 'failed', message: message(e) } : r));
        if ([401, 403].includes(e.response?.status)) { setError('Login kembali sebelum melanjutkan.'); break; }
      }
    }
    setBusy(false);
  }
  async function zip() {
    setZipping(true); setError('');
    try {
      const [{ default: QRCode }, { default: JSZip }] = await Promise.all([import('qrcode'), import('jszip')]);
      const archive = new JSZip();
      const safe = s => String(s).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const csv = [['ID', 'Nama', 'Klub', 'File']];
      for (const player of players) {
        const filename = safe(player.team.name) + '/' + player.id + '_' + safe(player.name) + '.png';
        const url = await QRCode.toDataURL(player.qr_code, { errorCorrectionLevel: 'H', margin: 4, scale: 24 });
        archive.file(filename, url.split(',')[1], { base64: true });
        csv.push([player.id, player.name, player.team.name, filename]);
      }
      const cell = v => '"' + String(v).replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
      archive.file('daftar-pemain.csv', '\uFEFF' + csv.map(r => r.map(cell).join(',')).join('\r\n'));
      archive.file('PETUNJUK.txt', 'Cetak QR persegi minimal 3 x 3 cm. Pertahankan batas putih. Jangan mengganti token setelah kartu dicetak. Uji scan hasil cetak lewat Screening admin.');
      download(await archive.generateAsync({ type: 'blob' }), 'qr-hasil-impor-' + Date.now() + '.zip');
    } catch { setError('Gagal membuat ZIP QR. Silakan coba lagi.'); } finally { setZipping(false); }
  }
  return <div className="max-w-7xl mx-auto space-y-6">
    <Link to="/admin/players" className="inline-flex items-center gap-2 text-primary"><ArrowLeft size={18} /> Manajemen pemain</Link>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1>Import pemain</h1><p className="text-slate-500 mt-2">Tambahkan banyak pemain sekaligus melalui CSV.</p></div>
      <button type="button" onClick={template} className="inline-flex items-center gap-2 border rounded-xl px-4 py-3"><Download size={18} /> Download template</button>
    </div>
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
      <h2 className="font-semibold">Siapkan data pendaftaran</h2>
      <ol className="list-decimal pl-5 space-y-2 text-sm">
        <li>Buka template di Excel atau Google Sheets. Pertahankan enam judul kolom dan simpan sebagai CSV UTF-8.</li>
        <li>Isi nama, klub yang sudah tersedia di Manajemen Tim, dan nomor punggung 0?999. Nama klub boleh memakai huruf besar/kecil atau awalan SSB.</li>
        <li>Isi tempat/tanggal lahir dan sekolah. Foto opsional: tautan Drive publik JPG/PNG/WebP maksimal 10 MB; PDF belum didukung.</li>
        <li>Nama yang sama akan dilewati, termasuk jika klub berbeda. Perubahan pemain lama melalui Edit. Maksimal 200 pemain per CSV.</li>
      </ol>
      <p className="text-sm text-slate-500">Contoh tempat/tanggal lahir: Sidoarjo, 14 Juli 2014. Unduh QR hasil impor sebelum membuka file baru atau meninggalkan halaman.</p>
      <div className="flex flex-wrap gap-3 items-center">
        <input type="file" accept=".csv,text/csv" aria-label="File CSV pemain" disabled={busy || zipping} onChange={e => { setFile(e.target.files[0] || null); setRows([]); setError(''); }} />
        <button type="button" disabled={!file || busy || zipping} onClick={preview} className="bg-primary px-5 py-3 rounded-xl inline-flex items-center gap-2"><Upload size={18} /> {busy && !rows.length ? 'Memeriksa...' : 'Lihat pratinjau'}</button>
      </div>
    </section>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {!!rows.length && <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite">{rows.length} baris ? {ready.length} siap / coba ulang ? {rows.filter(r => r.status === 'created').length} tersimpan</p>
        <button type="button" onClick={run} disabled={busy || zipping || !ready.length} className="bg-primary rounded-xl px-5 py-3">{busy ? 'Mengimpor... jangan tutup halaman' : 'Simpan ' + ready.length + ' pemain'}</button>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800"><table className="w-full text-left">
        <thead><tr>{['Baris', 'Pemain', 'Klub / Nomor', 'Biodata', 'Status'].map(t => <th key={t} className="p-4">{t}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.line} className="border-t border-slate-200 dark:border-slate-800">
          <td className="px-4">{row.line}</td><td className="px-4 font-semibold">{row.name || '?'}</td>
          <td className="px-4">{row.team_name}<br />#{row.jersey_number}</td><td className="px-4">{row.birth_place_date}<br />{row.school_origin}</td>
          <td className="px-4 min-w-56"><strong className={['error', 'failed'].includes(row.status) ? 'text-red-600' : 'text-primary'}>{labels[row.status]}</strong><p className="text-sm mt-1">{row.message}</p></td>
        </tr>)}</tbody>
      </table></div>
    </section>}
    {!!players.length && <section className="rounded-3xl border border-emerald-300 p-6 space-y-3">
      <h2 className="font-semibold">{players.length} pemain berhasil ditambahkan</h2>
      <p>QR memakai token pemain yang tersimpan di database.</p>
      <button type="button" disabled={busy || zipping} onClick={zip} className="bg-primary rounded-xl px-5 py-3 inline-flex gap-2 items-center"><Download size={18} /> {zipping ? 'Menyiapkan ZIP...' : 'Download ZIP QR hasil impor'}</button>
    </section>}
  </div>;
}
