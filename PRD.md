# KBMLeague — Product Requirements Document

| Atribut | Nilai |
| --- | --- |
| Versi | 2.0 |
| Tanggal | 12 Oktober 2026 |
| Platform | Web publik/user dan web admin dalam satu frontend React |
| Domain frontend | https://kbmleague.my.id |
| Status | Kebutuhan sesuai perubahan profil pemain dan penghapusan statistik individu |

## 1. Tujuan produk

KBMLeague memusatkan identitas tim, pemain, sekolah asal, jadwal, hasil pertandingan, dan klasemen kompetisi. Web publik menyediakan informasi; web admin mengelola data peserta dan pertandingan serta mencari identitas pemain lewat QR.

Statistik individu, posisi, ukuran tubuh, rating pemain, dan leaderboard individu telah dihapus. Skor pertandingan serta klasemen tim tetap merupakan bagian produk. Data berubah pada tampilan setelah dimuat ulang; belum ada push update real-time.

## 2. Dua area web dan hak akses

| Aspek | Web publik/user | Web admin |
| --- | --- | --- |
| Pintu masuk | `/` | `/admin/dashboard` |
| Pengguna | Pengunjung, akun biasa, dan admin | Akun dengan `is_admin = true` |
| Fungsi | Membaca identitas peserta dan informasi pertandingan | Membuat/edit/hapus peserta, hasil pertandingan, upload, dan QR |
| Navigasi | Navbar, menu mobile, footer, menu akun | Sidebar, breadcrumb, menu mobile, logout |
| Sumber data | Laravel API dan database bersama | Laravel API dan database yang sama |
| Login | Tidak wajib untuk informasi publik | Wajib dan diverifikasi ulang backend |
| Tema | Terang/gelap | Terang/gelap |

Kedua area berada dalam satu frontend React dengan layout berbeda, bukan dua backend terpisah. Registrasi membuat akun biasa, bukan record pemain atau tim.

| Tindakan | Pengunjung | User biasa | Admin |
| --- | --- | --- | --- |
| Membaca tim, pemain, jadwal, klasemen | Ya | Ya | Ya |
| Mencari nama pemain, tim, atau sekolah | Ya | Ya | Ya |
| Registrasi/login | Ya | Ya | Ya |
| Logout akun aktif | Tidak | Ya | Ya |
| Dashboard admin dan perubahan data | Tidak | Tidak | Ya |
| Upload gambar, buat ulang QR, cetak kartu | Tidak | Tidak | Ya |
| Screening kamera | Tidak | Tidak | Ya |
| Pengelolaan peran melalui UI | Belum tersedia | Belum tersedia | Belum tersedia |

## 3. Fitur web publik/user

### 3.1 Beranda — `/`

- Hero ilustrasi lapangan dan tautan ke jadwal/klasemen.
- Ringkasan total tim, pemain, pertandingan, dan laga selesai.
- Kartu pertandingan berikutnya serta cuplikan jadwal/hasil.
- Cuplikan klasemen maksimal empat tim.
- Tautan eksplorasi tim dan identitas pemain.
- Loading, keadaan kosong, dan retry ketika pemuatan gagal; tidak menampilkan angka contoh.

### 3.2 Tim — `/teams` dan `/teams/:id`

- Daftar identitas klub, logo atau inisial, dan jumlah pemain.
- Detail nama, tahun berdiri, deskripsi, dan seluruh skuad tanpa pengelompokan posisi.
- Kartu skuad menampilkan nama, nomor punggung, tim, foto, serta sekolah asal.
- Jadwal/hasil yang melibatkan klub dan navigasi ke profil pemain.

### 3.3 Pemain — `/players` dan `/players/:id`

- Pencarian berdasarkan nama, tim, dan sekolah pada daftar publik.
- Profil menampilkan nama, foto, nomor punggung, tim, asal sekolah, tempat/tanggal lahir, dan status aktif.
- Field kosong diberi keterangan; profil tidak menampilkan posisi, tinggi, berat, rating, atau riwayat statistik.
- Pemain tidak ditemukan ditangani dengan pesan dan tautan kembali.

### 3.4 Jadwal dan hasil — `/fixtures`

- Nama tim home/away, waktu, venue, status, dan kedua skor.
- Filter semua, `scheduled`, atau `completed`.
- Skor akhir hanya ditampilkan sebagai hasil pada laga selesai.
- Data API diurutkan berdasarkan waktu pertandingan.

### 3.5 Klasemen — `/league-table`

- Main, menang, seri, kalah, gol memasukkan/kebobolan, selisih gol, dan poin tiap tim.
- Hanya fixture `completed` memengaruhi klasemen.
- Menang 3 poin, seri 1 poin, kalah 0 poin.
- Urutan: poin, selisih gol, kemudian gol memasukkan; belum ada pembeda tambahan jika semuanya sama.

### 3.6 Akun — `/register` dan `/login`

- Registrasi nama, email unik, password minimal delapan karakter, dan konfirmasi password.
- Login email/password menghasilkan token Sanctum; bukan OAuth Google.
- User biasa diarahkan ke beranda, admin ke dashboard.
- Logout menghapus token aktif dan akun lokal.
- Akun biasa tidak mempunyai editor profil pemain, fitur favorit, atau akses admin.

## 4. Fitur web admin

| Modul | URL | Kemampuan |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | Total tim/pemain/fixture, laga selesai/terjadwal, fixture terbaru, dan aksi cepat |
| Daftar tim | `/admin/teams` | Cari, edit, dan hapus klub |
| Tambah/edit tim | `/admin/teams/create`, `/admin/teams/:id/edit` | Nama, logo, tahun berdiri, deskripsi |
| Daftar pemain | `/admin/players` | Cari nama/tim/sekolah; edit, hapus, buat ulang QR, pratinjau/cetak kartu |
| Tambah/edit pemain | `/admin/players/create`, `/admin/players/:id/edit` | Identitas, tim, sekolah, tempat/tanggal lahir, foto, nomor punggung, status |
| Pertandingan | `/admin/fixtures` | Cari peserta/venue/status, edit hasil, dan hapus |
| Buat pertandingan | `/admin/fixtures/create` | Dua peserta berbeda, waktu, venue, status |
| Edit hasil | `/admin/fixtures/:id/edit` | Skor home/away dan status; bukan editor lengkap semua detail jadwal |
| Screening | `/admin/screening` | Mulai/hentikan kamera, cari pemain dari QR, tampilkan identitas, pindai berikutnya |

### 4.1 Form pemain

- Tim harus sudah tersedia; nama dan nomor punggung wajib.
- `school_origin`: teks opsional maksimal 255 karakter, contoh SMA Negeri 1.
- `birth_place_date`: satu teks opsional maksimal 255 karakter, contoh Surabaya, 15 Mei 2008.
- Karena tempat/tanggal lahir disimpan sebagai VARCHAR, tidak ada kalkulasi usia atau validasi tanggal kalender otomatis.
- Foto opsional, JPG/JPEG/PNG/WebP maksimal 2 MB.
- Tanggal lahir lama dipindahkan ke teks `birth_place_date`; tempat lahir dapat dilengkapi melalui edit.
- Tombol simpan tidak aktif selama penyimpanan/upload atau jika tim belum tersedia.

### 4.2 Kartu dan screening

- Token unik dibuat saat pemain ditambahkan; pembuatan ulang mengganti token lama setelah konfirmasi.
- Kartu memuat identitas baru, sekolah, tempat/tanggal lahir, serta QR.
- Cetak kartu memakai jendela cetak browser dan memerlukan izin popup.
- Kamera membutuhkan izin dan HTTPS/localhost; hasil QR dicari pada API khusus admin.
- Screening hanya menampilkan identitas, tidak menyimpan absensi/kelayakan bermain.
- Gambar QR kartu masih menggunakan layanan eksternal yang perlu diverifikasi saat deployment.

## 5. Model data pemain

| Kolom | Tipe | Aturan |
| --- | --- | --- |
| id | BIGINT unsigned | Primary key |
| team_id | BIGINT unsigned | Foreign key ke teams; cascade delete |
| name | VARCHAR(255) | Wajib |
| photo | VARCHAR(255) | Nullable |
| qr_code | VARCHAR(255) | Nullable dan unik; token pemain |
| jersey_number | INTEGER | Wajib |
| school_origin | VARCHAR(255) | Nullable; asal sekolah |
| birth_place_date | VARCHAR(255) | Nullable; tempat dan tanggal lahir |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu perubahan |

Kolom height, weight, position, overall_rating, dan birth_date dihapus melalui migrasi baru. Tabel player_stats juga dihapus. Migrasi historis dipertahankan agar jalur instalasi dan histori schema konsisten.

## 6. API dan hubungan dua web

| Akses | Endpoint |
| --- | --- |
| Publik | GET teams, teams/{id}, players, players/{id}, fixtures, fixtures/{id}, league-table, dashboard-stats |
| Autentikasi | POST register, login; GET me dan POST logout menggunakan token |
| Admin | POST/PUT/DELETE teams, players, fixtures; POST upload; POST players/{id}/generate-qr; GET players/by-qr/{token} |

Semua route memakai prefix `/api`. Route player-stats dan leaderboard dihapus. Pencarian API pemain mencakup nama, sekolah, dan nama tim; filter team_id tetap tersedia; urutan pemain berdasarkan nama.

| Perubahan admin | Dampak web publik |
| --- | --- |
| Simpan profil tim | Identitas klub, daftar tim, dan tampilan peserta fixture berubah |
| Simpan profil pemain | Daftar pemain, detail, dan skuad klub diperbarui |
| Simpan hasil pertandingan | Jadwal/hasil dan klasemen dihitung ulang saat diminta |
| Upload lalu simpan profil | Foto/logo baru ditampilkan |
| Buat ulang QR | Kartu dan pencarian screening berubah; token lama tidak lagi cocok |
| Hapus peserta/fixture | Data terkait terkena cascade sesuai foreign key |

## 7. Keamanan dan UX

- Backend memvalidasi input dan hak admin, terlepas dari pembatasan menu frontend.
- Token Bearer menggunakan Sanctum; password di-hash dan tidak dimuat pada respons.
- Respons 401 membersihkan sesi lokal; nonadmin tidak dapat menulis data.
- Tampilan responsif, fokus keyboard terlihat, teks berkontras cukup, dan mode gelap tersedia.
- Penghapusan tim/fixture dapat berdampak berantai; gunakan konfirmasi yang jelas.
- Error, loading, data kosong, dan proses penyimpanan harus dapat dibedakan.

## 8. Kriteria penerimaan

1. Admin dapat menyimpan pemain hanya dengan tim, nama, nomor punggung, dan atribut opsional baru.
2. Field sekolah/tempat tanggal lahir tersimpan dan muncul pada profil, daftar, kartu, dan screening.
3. Field yang dihapus tidak muncul di API/form/profil pemain.
4. Pencarian sekolah menemukan pemain yang sesuai.
5. Endpoint statistik/leaderboard tidak tersedia dan menu terkait hilang.
6. Beranda/dashboard tidak meminta endpoint statistik atau kolom rating.
7. Migrasi mempertahankan ID pemain, relasi tim, foto, nomor punggung, status, dan token QR.
8. Tanggal lahir lama dipindahkan sebagai teks sebelum kolom lama dihapus.
9. Jadwal, skor, dan klasemen tetap bekerja setelah penghapusan statistik individu.
10. Pengunjung/user biasa tidak dapat mengubah data lewat API admin.

## 9. Deployment dan migrasi

Frontend di GitHub Pages pada kbmleague.my.id; source main dibangun ke gh-pages. Backend Laravel membutuhkan hosting HTTPS/database terpisah. VITE_API_BASE_URL harus mengarah ke API produksi; tanpa konfigurasi, frontend tidak menghubungi localhost pengunjung.

Jalankan migrasi pada backend setelah membuat backup. Jangan memakai migrate:fresh pada database nyata. Migrasi penghapusan tidak dapat mengembalikan isi kolom/statistik lama melalui rollback; rollback hanya membentuk ulang schema. Backup data yang dihapus harus disimpan secara privat.

## 10. Batasan dan pengembangan berikutnya

Belum tersedia: liga/musim terpisah, edit jadwal lengkap, manajemen akun/peran, audit log, notifikasi, absensi QR, dan pemulihan password. Peningkatan berikutnya dapat mencakup pagination, generator QR lokal, validasi identitas terstruktur, serta pengujian browser/perangkat.

Statistik dan rating individu tidak menjadi rencana aktif kecuali diminta kembali. Target kinerja serta skala pengguna belum ditetapkan.
