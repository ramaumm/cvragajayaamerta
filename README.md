# Medical Equipment Sales System

Sistem nota internal untuk penjualan alat kesehatan dengan desain monokrom minimalis yang terinspirasi dari Apple.

## Fitur Utama

- **Autentikasi**: Login dan registrasi admin
- **Manajemen Produk**: CRUD produk alat kesehatan dengan pencarian dan filter kategori
- **Pembuatan Nota**: Sistem keranjang untuk membuat nota penjualan
- **Riwayat Nota**: Lihat dan kelola semua transaksi yang telah dibuat
- **Laporan Penjualan**: Analisis performa dengan grafik dan statistik (harian, bulanan, tahunan)
- **Ekspor PDF**: Cetak nota penjualan dalam format profesional

## Setup Database

1. Buka Supabase Dashboard Anda
2. Navigasi ke SQL Editor
3. Jalankan script SQL dari file `supabase-migration.sql`
4. Script akan membuat:
   - Tabel `products`, `transactions`, dan `transaction_items`
   - Row Level Security policies
   - Storage bucket untuk gambar produk
   - Data dummy 15 produk alat kesehatan

## Instalasi

```bash
npm install
npm run dev
```

## Teknologi

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Database, Auth, Storage)
- Lucide React (Icons)

## Struktur Folder

```
src/
├── components/
│   ├── auth/          # Komponen login dan register
│   ├── layout/        # Navbar dan layout komponen
│   └── ui/            # Komponen UI reusable (Button, Input, Modal, Toast, Loading)
├── context/           # Auth context untuk state management
├── hooks/             # Custom hooks (useToast)
├── lib/               # Supabase client dan utility functions
├── pages/             # Halaman utama (Products, History, Reports, CreateNota)
└── App.tsx            # Main app component
```

## Cara Penggunaan

### 1. Register / Login
- Buat akun admin baru atau login dengan akun existing
- Semua user adalah admin (tidak ada role berbeda)

### 2. Kelola Produk
- Tambah, edit, atau hapus produk alat kesehatan
- Cari produk berdasarkan nama atau SKU
- Filter produk berdasarkan kategori

### 3. Buat Nota
- Pilih produk dan tambahkan ke keranjang
- Atur jumlah untuk setiap produk
- Isi data pelanggan (nama, telepon, alamat)
- Simpan nota ke database

### 4. Lihat Riwayat
- Browse semua nota yang pernah dibuat
- Cari berdasarkan nomor transaksi atau nama pelanggan
- Lihat detail lengkap setiap transaksi
- Ekspor/cetak nota ke PDF

### 5. Analisis Laporan
- Lihat statistik penjualan (hari ini, bulan ini, tahun ini)
- Total pendapatan dan jumlah transaksi
- Grafik pendapatan harian
- Top 5 produk terlaris

## Desain

Website menggunakan tema monokrom dengan:
- Warna dominan: Putih, Hitam, Abu-abu
- Tipografi yang bersih dan mudah dibaca
- Animasi halus pada interaksi
- Layout responsif untuk mobile, tablet, dan desktop
- Spacing konsisten (8px grid system)
- Komponen yang minimalis dan profesional

## Keamanan

- Row Level Security (RLS) aktif di semua tabel
- Hanya authenticated users yang dapat mengakses data
- Password dienkripsi oleh Supabase Auth
- Validasi input di frontend dan backend

## Notes

- File `supabase-migration.sql` berisi semua query SQL yang diperlukan
- Data dummy 15 produk alat kesehatan sudah termasuk dalam migration
- Storage bucket untuk gambar produk sudah dikonfigurasi
- Sistem tracking stok otomatis saat nota dibuat
