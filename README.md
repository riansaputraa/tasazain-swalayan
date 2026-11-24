# 🏪 Tasazain Swalayan - Enterprise POS & Retail Management System

Sistem Manajemen Retail, Kasir Point of Sale (POS), Inventori Stok, dan Laporan Keuangan Arus Kas modern bertema **Executive Monochrome Dark Luxury**, dirancang dari spesifikasi desain Google Stitch dan dibangun menggunakan arsitektur Full-Stack (Laravel 11 REST API + React & Tailwind CSS v4).

---

## 🚀 Fitur Utama

1. **Dashboard Overview Finansial & Inventori**:
   - 4 KPI Card: Pemasukan Penjualan, Pengeluaran, Laba Bersih, & Peringatan Stok Menipis.
   - Grafik Komparasi Tren Arus Kas 6 Bulan Terakhir.
   - Watchlist produk dengan stok di bawah batas aman (*Safety Stock*).
2. **Terminal Kasir POS (Point of Sale)**:
   - Pencarian instan dan scanner barcode SKU barang (*Enter to Add*).
   - Filter kategori cepat (Sembako, Minuman, Makanan Ringan, Perawatan, dll).
   - Keranjang belanja interaktif dengan kalkulasi subtotal otomatis.
   - Multi-metode pembayaran (Tunai, QRIS, Transfer Bank) dengan auto kalkulasi kembalian.
   - **Struk Transaksi Cetak Resmi (Printable Receipt Modal)**.
3. **Katalog & Manajemen Stok Produk**:
   - Tracking SKU, Harga Beli, Harga Jual Eceran, dan Persentase Margin Keuntungan.
   - Safety Stock Alert: Otomatis mendeteksi produk yang hampir habis (`AMAN`, `TIPIS`, `HABIS`).
   - Modal tambah produk baru dan pengeditan harga/stok.
4. **Kulakan Restock & Order Supplier**:
   - Pencatatan pemesanan stok grosir ke distributor rekanan (PT Indofood, PT Wings Surya, PT Mayora, dll).
   - Otomatis menambah saldo stok produk dan mencatat pengeluaran di buku kas.
5. **Buku Kas & Laporan Keuangan (Cash Flow Ledger)**:
   - Pencatatan otomatis setiap transaksi (Penjualan Kasir, Kulakan Restock, & Biaya Operasional).
   - Filter Arus Kas Masuk vs Kas Keluar dengan Running Balance (*Saldo Akhir*).
   - Pencatatan biaya operasional toko (Listrik PLN, Sewa, Gaji Staf).
6. **Manajemen Staf & Pengguna**:
   - Hak akses berjenjang (Role: `admin` / Store Manager & `kasir` / Staf Kasir Toko).

---

## 🛠️ Tech Stack

- **Backend**: Laravel 11, PHP 8.2+, Laravel Sanctum (Token Auth), MySQL / MariaDB
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Material Symbols Outlined, Hanken Grotesk & Manrope Fonts

---

## ⚙️ Panduan Menjalankan Project

### 1. Prasyarat
- PHP >= 8.2 & Composer
- Node.js >= 18 & npm
- MySQL / XAMPP Database Server

### 2. Setup Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env # atau sesuaikan konfigurasi DB di .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8001
```

### 3. Setup Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Buka browser di: `http://localhost:5173/`

---

## 🔑 Akun Demo Login

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Store Manager (Admin)** | `admin@swalayan.com` | `password` | Semua Fitur Sistem |
| **Kasir Toko** | `kasir@swalayan.com` | `password` | Kasir POS & Dashboard |

---

## 📄 Lisensi
Hak Cipta © 2026 Tasazain Swalayan Enterprise. All Rights Reserved.
