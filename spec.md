# Tanggapi Bantuan Bencana

## Current State
Aplikasi memiliki dua modul terpisah:
- **Penerima Bantuan** (`/penerima-bantuan`) - form input data penerima bantuan pasca bencana (BantuanPenerima) dengan field: NIK, nama, alamat, keperluan, keterangan, proses tindak lanjut, instansi pembantu, status validasi
- **Validasi Data Bencana** (`/validasi`) - form input data korban bencana (DisasterVictim) dengan field: NIK, nama lengkap, RT/RW, kelurahan, kecamatan, kabupaten, jenis bencana, kondisi fisik, tingkat kerusakan, dll.

Kedua modul tidak saling terhubung - admin harus memasukkan data yang sama (NIK, nama, alamat) dua kali secara manual.

## Requested Changes (Diff)

### Add
- Di form Penerima Bantuan: tambahkan section "Cari dari Data Validasi" - dropdown/search yang mengambil data dari DisasterVictim berdasarkan NIK atau nama. Saat dipilih, otomatis mengisi field: NIK, nama, alamat (gabungan RT/RW/kelurahan/kecamatan/kabupaten), dan keperluan bantuan (dari needType validasi terkait jika ada)
- Di halaman Validasi Data tab "Data Penduduk Terdampak": tambahkan tombol aksi "Buat Penerima Bantuan" pada setiap baris korban. Klik tombol akan membuka form PenerimaBantuan pre-filled dengan data korban tersebut
- Indikator sinkronisasi: di tabel Penerima Bantuan, tampilkan badge/ikon jika data berasal dari Validasi Data (ada referensi victimId)
- Di form tambah kebutuhan validasi (ValidationRecord): ketika memilih korban, otomatis menampilkan jika korban sudah terdaftar sebagai Penerima Bantuan

### Modify
- `PenerimaBantuanPage.tsx` - BantuanFormDialog: tambahkan section lookup dari DisasterVictim di bagian atas form, dengan combobox searchable yang memuat semua korban. Saat dipilih, auto-fill NIK, nama, alamat gabungan, dan set field `victimRef` (nama korban + jenis bencana) di keterangan
- `ValidasiPage.tsx` - DisasterVictimsTab: tambahkan aksi tombol "Buat Penerima" di setiap baris, yang navigasi ke halaman Penerima Bantuan dengan state pre-filled data korban

### Remove
- Tidak ada yang dihapus

## Implementation Plan
1. Di `PenerimaBantuanPage.tsx`:
   - Import `useGetAllDisasterVictims` di BantuanFormDialog
   - Tambah state `selectedVictimId` untuk melacak korban yang dipilih
   - Tambah combobox searchable "Cari dari Data Validasi" di atas form - mencari berdasarkan nama/NIK dari daftar DisasterVictim
   - Saat korban dipilih: auto-fill `nik`, `nama`, `alamat` (gabungan RT/RW/kelurahan/kecamatan/kabupaten), dan tambah prefix di `keterangan` dengan info bencana
   - Tambah tombol "Hapus Pilihan" untuk membatalkan auto-fill

2. Di `ValidasiPage.tsx` - DisasterVictimsTab:
   - Import `useNavigate` dari react-router-dom atau gunakan state passing via window.history
   - Tambahkan tombol ikon "Buat Penerima Bantuan" (icon: UserPlus) di kolom Aksi setiap baris
   - Saat diklik: navigasi ke `/penerima-bantuan` dengan query param `?victimId=X` atau simpan di sessionStorage, kemudian form PenerimaBantuan langsung membuka dialog dengan data pre-filled

3. Di `PenerimaBantuanPage.tsx` - main component:
   - Baca query param `victimId` dari URL saat halaman dimuat
   - Jika ada, fetch data victim tersebut dan buka form dialog dengan data pre-filled
