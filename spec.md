# TANGGAPI - Sistem Informasi Data Penerima Bantuan Bencana

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Dashboard utama** dengan statistik ringkasan: total penerima bantuan, jumlah per jenis bantuan, jumlah per kabupaten/kota
- **Manajemen data penerima bantuan**: form pendaftaran, daftar penerima, detail penerima
- **Filter dan pencarian**: berdasarkan kabupaten/kota, jenis bantuan, status distribusi
- **Halaman Peta** menampilkan sebaran penerima bantuan per wilayah (visual peta sederhana/tabel per wilayah)
- **Halaman Laporan/Publikasi**: daftar laporan bencana, detail laporan dengan tag kategori
- **Halaman Pengaduan (Tanggapi)**: form pengaduan warga, daftar pengaduan, filter topik
- **Role-based access**: Admin dapat tambah/edit/hapus data; publik hanya bisa lihat
- **Navigasi**: header dengan logo Tanggapi, menu Peta, Tanggapi, Publikasi, Dashboard

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. **Data Model Penerima Bantuan**: id, nama, NIK, alamat, kabupaten, jenis bantuan, jumlah bantuan, status distribusi, tanggal, koordinat wilayah
2. **Data Model Pengaduan**: id, judul, deskripsi, topik, nama pelapor, tanggal, status
3. **Data Model Publikasi/Laporan**: id, judul, ringkasan, konten, penulis, tanggal, tags, kategori
4. **CRUD endpoints** untuk setiap data model
5. **Statistik**: total per kabupaten, per jenis bantuan, per status
6. **Filter/search** penerima bantuan dan pengaduan

### Frontend (React + TypeScript + Tailwind)
1. Layout dengan header navigasi ala Tanggapi (logo, menu Peta/Tanggapi/Publikasi)
2. Dashboard: kartu statistik, grafik distribusi bantuan per wilayah
3. Halaman Peta: tabel/visual sebaran bantuan per kabupaten
4. Halaman Tanggapi: daftar pengaduan dengan filter topik, form tambah pengaduan
5. Halaman Publikasi: grid/list artikel laporan dengan thumbnail, tag, dan metadata
6. Halaman Admin: form CRUD penerima bantuan (jika admin login)
7. Halaman detail penerima bantuan
8. Komponen pencarian dan filter global
