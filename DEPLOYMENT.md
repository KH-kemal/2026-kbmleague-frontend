# Publikasi KBMLeague ke GitHub Pages

Domain: **https://kbmleague.my.id**.

## 1. Apa yang sudah disiapkan

- `main` menyimpan source React/Vite.
- Workflow `Build frontend to gh-pages` membangun website dan menerbitkan hasilnya ke branch `gh-pages` pada setiap push `main`, atau saat dijalankan manual.
- `public/CNAME` dibawa ke hasil build agar domain tidak hilang pada deployment berikutnya.
- Asset memakai path root `/` karena website menggunakan custom domain.
- `404.html` berisi entry point React supaya URL seperti `/teams/1` atau `/admin/dashboard` bisa dibuka langsung.
- `.nojekyll` membuat file build dilayani sebagai website statis.
- Produksi tanpa URL API tidak menghubungi localhost pengunjung.

GitHub Pages hanya menyajikan frontend. Laravel, database, dan gambar upload harus berada pada hosting backend terpisah. Saat backend belum tersedia, tampilan frontend dapat dipublikasikan, tetapi login, registrasi, screening, dan data kompetisi belum berfungsi.

## 2. Aktifkan build dan pilih branch

1. Buka repository `KH-kemal/2026-kbmleague-frontend`.
2. Buka **Actions** dan pastikan workflow **Build frontend to gh-pages** berhasil. Jika belum berjalan, pilih **Run workflow** pada branch `main`.
3. Jika publish ditolak karena izin token, buka **Settings → Actions → General → Workflow permissions**, pilih **Read and write permissions**, lalu jalankan ulang workflow. Kebijakan organisasi juga dapat membatasi izin ini.
4. Setelah branch `gh-pages` terbentuk, buka **Settings → Pages**.
5. Pilih **Source: Deploy from a branch**.
6. Pilih **Branch: gh-pages**, **Folder: /(root)**, lalu **Save**.
7. Masukkan **Custom domain: kbmleague.my.id**, lalu **Save**.

Jangan memilih `main` sebagai branch website: branch tersebut berisi source yang membutuhkan build. File CNAME saja tidak menggantikan pengaturan Custom domain pada Pages.

## 3. Atur DNS domain

Pada panel penyedia DNS untuk `kbmleague.my.id`, buat empat record A pada domain utama:

| Type | Name / Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

TTL dapat memakai default penyedia. Sebagai alternatif, gunakan ALIAS/ANAME untuk domain utama menuju `KH-kemal.github.io` jika penyedia mendukungnya. Jangan memakai CNAME biasa pada domain utama jika DNS provider tidak mendukung CNAME flattening.

Opsional: buat CNAME `www` menuju `KH-kemal.github.io` agar www.kbmleague.my.id dapat diarahkan oleh GitHub ke domain utama.

Sesuaikan record A/AAAA domain utama yang bertentangan dengan GitHub Pages. Jangan menghapus record MX/TXT email. Jika menggunakan proxy, gunakan mode DNS-only untuk verifikasi awal.

Periksa DNS setelah penyimpanan:

```powershell
Resolve-DnsName kbmleague.my.id -Type A
```

Hasil yang diharapkan adalah IP GitHub Pages di atas. Propagasi DNS dan sertifikat HTTPS dapat memerlukan hingga 24 jam. Simpan Custom domain di GitHub Pages terlebih dahulu sebelum mengarahkan DNS.

## 4. Aktifkan HTTPS

1. Tunggu pemeriksaan DNS pada **Settings → Pages** berhasil.
2. Tunggu sertifikat tersedia, kemudian aktifkan **Enforce HTTPS**.
3. Buka `https://kbmleague.my.id`.

Jika gagal, periksa deployment di Actions, record CNAME, record host yang bertentangan, dan status sertifikat. Menyimpan Custom domain tidak otomatis mengubah DNS pada penyedia domain.

## 5. Hubungkan backend saat sudah di-hosting

1. Deploy Laravel dan database ke layanan yang mendukung PHP/Laravel.
2. Pastikan API memiliki URL HTTPS publik dan route `/api` dapat diakses.
3. Atur `APP_URL` backend ke alamat backend sebenarnya. Jalankan migrasi secara aman dan `php artisan storage:link`; pastikan URL logo/foto memakai HTTPS.
4. Atur CORS backend untuk mengizinkan origin `https://kbmleague.my.id`, metode API, serta header `Authorization` dan `Content-Type`.
5. Di repository frontend, buka **Settings → Secrets and variables → Actions → Variables**.
6. Tambah repository variable **VITE_API_BASE_URL** dengan URL API sebenarnya, termasuk `/api`. Contoh ilustratif: `https://api.kbmleague.my.id/api`; alamat tersebut belum diasumsikan tersedia.
7. Jalankan ulang workflow **Build frontend to gh-pages**. Variabel Vite masuk saat build, sehingga perubahan nilai memerlukan build baru.
8. Uji data publik, registrasi/login, akses admin, upload gambar, dan QR melalui HTTPS.

Jangan memasukkan password database, `APP_KEY`, atau token rahasia ke variabel `VITE_*`: nilainya masuk JavaScript publik.

## 6. Pemeriksaan deployment

- Beranda menampilkan KBMLeague dan asset CSS/JS berhasil dimuat.
- Custom domain tetap tersimpan sesudah deployment baru.
- Buka `/teams` secara langsung dan refresh halaman.
- Uji navigasi mobile dan mode gelap.
- Setelah backend tersedia, pastikan tidak ada request menuju `127.0.0.1` atau `localhost`.
- Uji login admin dan data dari backend produksi, bukan database Laragon lokal.

Fallback GitHub Pages tetap menggunakan status HTTP 404 untuk URL langsung yang bukan file fisik, walaupun React merender halaman. Untuk respons HTTP 200 pada semua route dan kebutuhan SEO yang lebih kuat, gunakan hosting yang mendukung rewrite SPA.

## Referensi

- [Publishing source GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Custom domain GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages publishing action](https://github.com/peaceiris/actions-gh-pages)
