import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function PlayerQr({ player }) {
  const [image, setImage] = useState({ token: '', url: '', error: '' });
  const token = player.qr_code;
  useEffect(() => {
    if (!token) return;
    let active = true;
    import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(token, { errorCorrectionLevel: 'H', margin: 4, scale: 24 }))
      .then(url => { if (active) setImage({ token, url, error: '' }); })
      .catch(() => { if (active) setImage({ token, url: '', error: 'QR gagal disiapkan. Tutup lalu buka kembali kartu pemain.' }); });
    return () => { active = false; };
  }, [token]);
  if (!token) return <p className="mt-5">QR belum tersedia. Gunakan buat ulang QR di manajemen pemain.</p>;
  if (image.token !== token) return <p role="status" className="mt-5">Menyiapkan QR...</p>;
  if (image.error) return <p role="alert" className="mt-5 text-red-500">{image.error}</p>;
  const filename = 'qr-' + player.id + '-' + String(player.name).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100) + '.png';
  return <div className="mt-6 space-y-4"><img src={image.url} alt={'QR pemain ' + player.name} width={160} height={160} className="rounded-lg" /><a href={image.url} download={filename} className="bg-primary text-white rounded-xl px-5 py-3 inline-flex items-center gap-2"><Download size={17} /> Unduh QR PNG</a></div>;
}
