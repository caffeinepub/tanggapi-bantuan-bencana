# Tanggapi Bantuan Bencana

## Current State
Aplikasi sudah memiliki Admin Panel di route `/admin` yang hanya bisa diakses oleh pengguna yang login via Internet Identity dan memiliki role admin. Menu Admin sudah tampil di navbar untuk semua pengguna, dan Admin Panel punya tab: Penerima Bantuan, Pengaduan, Publikasi, Link Footer, Daftar User, dan Admin Validasi.

## Requested Changes (Diff)

### Add
- Halaman baru `/admin-panel` yang diproteksi dengan password sederhana (tanpa Internet Identity)
- Form login password dengan field password dan tombol masuk
- Setelah password benar, tampilkan konten Admin Panel lengkap (semua tab yang ada di AdminPage.tsx)
- Password disimpan secara hardcoded atau di localStorage (frontend only, tidak ada backend)
- Tombol "Keluar" di dalam panel untuk logout dari sesi password
- Menu "Admin Panel" di navbar yang mengarah ke `/admin-panel`

### Modify
- Layout.tsx: Tambahkan item navigasi "Admin Panel" di navbar (desktop dan mobile) mengarah ke `/admin-panel`
- App.tsx: Tambahkan route `/admin-panel` yang mengarah ke halaman baru AdminPanelPasswordPage

### Remove
- Tidak ada yang dihapus

## Implementation Plan
1. Buat file `src/frontend/src/pages/AdminPanelPasswordPage.tsx`:
   - State: `isAuthenticated` (boolean, dari sessionStorage)
   - Password default: `"rtik2024"` (hardcoded, bisa diubah oleh developer)
   - Tampilkan form login dengan field password dan tombol masuk jika belum autentikasi
   - Jika password benar, simpan di `sessionStorage` dan tampilkan konten admin lengkap (salin dari AdminPage.tsx tapi tidak perlu cek Internet Identity)
   - Tombol "Keluar" untuk menghapus sessionStorage dan kembali ke form login
   - Desain halaman login: logo RTIK, judul "Panel Admin", field password, tombol masuk

2. Edit `src/frontend/src/App.tsx`:
   - Import AdminPanelPasswordPage
   - Tambahkan route `/admin-panel`

3. Edit `src/frontend/src/components/Layout.tsx`:
   - Tambahkan item "Admin Panel" ke navItems atau sebagai link khusus di navbar (desktop dan mobile) dengan ikon `KeyRound` dari lucide-react
