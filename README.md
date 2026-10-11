# KBMLeague Frontend

React 19 + Vite untuk halaman publik dan portal admin KBMLeague. Seluruh data kompetisi diambil dari Laravel API; tidak ada akun Google simulasi atau data kompetisi bawaan.

## Menjalankan

```bash
npm install
npm run dev
```

Buat `.env` jika alamat API berbeda dari `http://127.0.0.1:8000/api`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Halaman

Pengunjung dapat membuka `/`, `/teams`, `/players`, `/fixtures`, `/league-table`, dan `/leaderboard` tanpa login. Detail tim dan pemain juga publik. `/login` dan `/register` menyediakan autentikasi. `/admin/*` memerlukan akun dengan `is_admin=true`; akses diperiksa ulang melalui `/api/me`, dan backend juga melindungi endpoint admin.

## Deployment ke domain

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk build otomatis ke branch `gh-pages`, pengaturan `kbmleague.my.id`, DNS, HTTPS, dan koneksi backend produksi.

Backend belum di-hosting. Frontend produksi tanpa `VITE_API_BASE_URL` tidak mengirim request ke localhost; data dan login membutuhkan backend HTTPS.

## Pemeriksaan build

```bash
npm run build
npm run lint
```

Build berhasil pada pemeriksaan terakhir. Lint masih memiliki temuan dari pola `useEffect` dan variabel yang belum dipakai pada sejumlah halaman.
