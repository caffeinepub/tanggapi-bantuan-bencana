# Tanggapi Bantuan Bencana

## Current State

Aplikasi sudah memiliki:
- Menu Beranda, Peta, Tanggapi, Publikasi, Penerima Bantuan, Validasi Data
- Admin Panel (password-based) dan Admin (Internet Identity)
- Data `BantuanPenerima`: id, nama, nik, alamat, keperluanBantuan, keterangan, prosesTindakLanjut, instansiPembantu, validasiStatus, tindakLanjutKeterangan, createdBy, createdDate, updatedDate
- Data `DisasterVictim`: id, nik, fullName, address, rt, rw, kelurahan, kecamatan, kabupaten, disasterType, disasterDate, physicalCondition, damageLevel, lossDescription, registeredBy, registrationDate
- Backend sudah memiliki `getAllBantuanPenerima()` dan `getAllDisasterVictims()`

## Requested Changes (Diff)

### Add
- **Halaman Rekap** (`/rekap`): halaman baru untuk merekap data penerima bantuan
  - Sortir dan filter berdasarkan kabupaten (dari field `alamat` pada BantuanPenerima dan `kabupaten` pada DisasterVictim)
  - Tampilkan tabel rekap berisi: nama, NIK, alamat, keperluan bantuan, status validasi, instansi pembantu, keterangan tindak lanjut
  - Ringkasan statistik per kabupaten: total penerima, breakdown status (baru/diproses/ditindaklanjuti)
  - Tombol ekspor ke PDF (per kabupaten atau semua kabupaten) -- menggunakan `window.print()` dengan CSS print-friendly tanpa library eksternal
  - Filter tambahan: status validasi (semua/baru/diproses/ditindaklanjuti)
  - Tampilan header PDF: logo RTIK, judul rekap, kabupaten yang difilter, tanggal cetak

- **Menu Rekap** di navbar (desktop dan mobile): ikon `BarChart3` dengan label "Rekap"

### Modify
- `App.tsx`: tambah route `/rekap` → `RekapPage`
- `Layout.tsx`: tambah item navigasi "Rekap" di `navItems` array

### Remove
- Tidak ada yang dihapus

## Implementation Plan

1. Buat `src/frontend/src/pages/RekapPage.tsx`:
   - Ambil semua data `BantuanPenerima` via `useGetAllBantuanPenerima()`
   - Parse kabupaten dari field `alamat` (ambil kata setelah "Kab." atau teks akhir alamat) + gunakan data DisasterVictim untuk kabupaten yang sudah terdaftar di validasi
   - Dropdown filter kabupaten (sorted A-Z), filter status validasi
   - Tabel rekap responsive
   - Tombol "Cetak PDF" yang trigger `window.print()` dengan print CSS
   - Summary cards: total, baru, diproses, ditindaklanjuti untuk kabupaten terpilih
   - Print layout: header dengan nama sistem, kabupaten, tanggal cetak, tabel data

2. Update `App.tsx`: import `RekapPage` dan tambahkan route
3. Update `Layout.tsx`: tambah `{ label: "Rekap", path: "/rekap", icon: BarChart3 }` ke `navItems`
