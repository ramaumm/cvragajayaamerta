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
```

### Environment Variables

1. Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

2. Isi environment variables di file `.env`:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. Jalankan development server:
```bash
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

## Deploy ke Vercel

### Langkah-langkah:

1. **Push project ke GitHub** (jika belum)

2. **Import project ke Vercel**:
   - Login ke [vercel.com](https://vercel.com)
   - Klik "Add New Project"
   - Import repository GitHub Anda

3. **Set Environment Variables di Vercel**:
   - Di Vercel project settings, buka tab "Environment Variables"
   - Tambahkan 2 environment variables berikut:
     ```
     VITE_SUPABASE_URL = https://lmukflfrgekbqjorhgtc.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdWtmbGZyZ2VrYnFqb3JoZ3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDMyMjYsImV4cCI6MjA3NjA3OTIyNn0.VORPqvjZaz177r8CSo81-PNMw_WERX2NdAPY7uBMMck
     ```
   - Pastikan environment type di-set ke **Production**, **Preview**, dan **Development**

4. **Deploy**:
   - Klik "Deploy"
   - Tunggu proses build selesai

5. **Akses aplikasi**:
   - Buka URL yang diberikan oleh Vercel
   - Login dengan PIN user yang sudah dibuat

### Troubleshooting Layar Putih di Vercel:

Jika aplikasi menampilkan layar putih setelah deploy:

1. **Periksa Environment Variables**:
   - Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah terset
   - Vercel memerlukan prefix `VITE_` untuk environment variables yang bisa diakses di client-side

2. **Periksa Build Logs**:
   - Buka Vercel dashboard → Project → Deployments → Klik deployment terakhir
   - Lihat build logs untuk error

3. **Periksa Browser Console**:
   - Buka aplikasi di browser
   - Tekan F12 untuk membuka Developer Tools
   - Lihat tab Console untuk error messages

4. **Redeploy**:
   - Setelah mengatur environment variables, trigger redeploy dengan:
     - Push perubahan baru ke GitHub, atau
     - Klik "Redeploy" di Vercel dashboard

## Notes

- File `supabase-migration.sql` berisi semua query SQL yang diperlukan
- Storage bucket untuk gambar produk sudah dikonfigurasi
- Sistem tracking stok otomatis saat nota dibuat
- Aplikasi menggunakan autentikasi custom dengan PIN (bukan Supabase Auth)
