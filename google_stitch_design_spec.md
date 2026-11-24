# Design Specification & Prompt Guide — Google Stitch
## Aplikasi Pengelola Keuangan & Stok Swalayan (Swalayan POS)

Dokumen ini disusun khusus sebagai bahan input / prompt specification untuk **Google Stitch** (maupun AI UI Generator lainnya). Berisi token desain global, hierarki komponen, layout wireframe, serta prompt teks presisi tinggi untuk tiap screen.

---

## 1. Global Design System & Design Tokens

### A. Color Palette (Dark Theme Modern - Deep Indigo & Slate)
| Token Name | Hex Code | Deskripsi / Penggunaan |
| :--- | :--- | :--- |
| `--bg-main` | `#0B0F19` | Latar belakang canvas utama aplikasi (deep space navy) |
| `--bg-surface` | `#111827` | Background sidebar, card, container panel utama |
| `--bg-surface-elevated`| `#1F2937` | Card modal, dropdown menu, input form background |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Garis batas card & divider table |
| `--border-focus` | `#6366F1` | Border active/focus pada input text |
| `--primary` | `#4F46E5` | Warna utama (Indigo / Royal Blue) - CTA Button & Active Menu |
| `--primary-hover` | `#4338CA` | Hover state tombol utama |
| `--success` | `#10B981` | Pemasukan / Saldo positif / Stok aman (Emerald green) |
| `--warning` | `#F59E0B` | Stok menipis / Peringatan / Pending (Amber) |
| `--danger` | `#EF4444` | Pengeluaran / Stok habis / Delete action (Rose red) |
| `--text-primary` | `#F9FAFB` | Headings, nilai angka KPI, label penting |
| `--text-secondary` | `#9CA3AF` | Subtitle, placeholder, header tabel, metadata |
| `--text-muted` | `#6B7280` | Caption, disabled item, watermark |

### B. Typography
- **Primary Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace (Angka & Mata Uang):** `'JetBrains Mono', 'Fira Code', monospace`
- **Scale:**
  - `H1 (Page Title):` 24px / SemiBold (600)
  - `H2 (Section/Card Title):` 18px / SemiBold (600)
  - `H3 (Sub-section):` 15px / Medium (500)
  - `Body Regular:` 14px / Regular (400)
  - `Body Small / Caption:` 12px / Regular (400)
  - `Metric/Stat Numbers:` 28px - 32px / Bold (700)

### C. Surface Effects & Glassmorphism
- **Card Styling:** `background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;`
- **Shadow:** `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`
- **Button Radius:** `8px`
- **Input Form Radius:** `8px`

---

## 2. Reusable UI Components

1. **Sidebar Navigation (Desktop App Shell):**
   - Lebar: `260px` fixed, background `#111827`, border kanan `1px solid rgba(255,255,255,0.08)`.
   - Brand header: Logo Swalayan POS + nama store.
   - User profile badge di footer: Avatar, Nama User, Role badge (Admin / Kasir), tombol Logout.
   - Menu Items: Dashboard, POS Kasir, Produk & Stok, Transaksi Kulakan, Laporan Keuangan, Pengguna.

2. **Top Header / App Bar:**
   - Tinggi: `64px`, sticky top.
   - Kiri: Page Title + Breadcrumbs dinamis.
   - Kanan: Indikator Jam Real-time, Notifikasi Stok Menipis (badge counter merah), Quick Action "+ Transaksi Baru".

3. **Status Badges:**
   - Stok Aman: Pill badge hijau muda (`bg: #064E3B`, `text: #34D399`)
   - Stok Menipis: Pill badge oranye (`bg: #78350F`, `text: #FBBF24`)
   - Stok Habis: Pill badge merah (`bg: #7F1D1D`, `text: #F87171`)

---

## 3. Screen Specifications & Google Stitch Prompts

Berikut adalah spesifikasi per layar lengkap dengan **Prompt Copy-Paste siap setor ke Google Stitch**:

---

### SCREEN 1: Authentication / Login Screen
#### A. Layout & Hierarchy
```text
+-------------------------------------------------------------+
|                Background: Dark Mesh Gradient               |
|                                                             |
|                 +-------------------------+                 |
|                 |      [Store Icon]       |                 |
|                 |      Swalayan POS       |                 |
|                 |  Sistem Keuangan & Stok |                 |
|                 |                         |                 |
|                 | Email Address [       ] |                 |
|                 | Password      [       ] |                 |
|                 |                         |                 |
|                 | [✔] Ingat Saya          |                 |
|                 |                         |                 |
|                 |   [  MASUK KE SISTEM  ] |                 |
|                 +-------------------------+                 |
|                                                             |
+-------------------------------------------------------------+
```
#### B. Stitch Prompt (Copy-Paste)
> **Prompt for Google Stitch:**
> *"Design a sleek, modern desktop login screen for 'Swalayan POS', a supermarket inventory and financial management web application. Dark mode theme with deep navy and slate tones (#0B0F19 background with subtle purple-blue ambient glow). Centered glassmorphic card with frosted glass effect, border-radius 16px, delicate border stroke (rgba(255,255,255,0.1)). Inside the card: store icon logo, bold title 'Swalayan POS', subtitle 'Silakan masuk untuk mengelola toko'. Two input fields: 'Email / Username' with email icon and 'Password' with eye toggle icon, styled with dark fill (#1F2937), rounded 8px borders. A 'Remember me' checkbox. A full-width primary CTA button with vibrant indigo-to-violet gradient (#4F46E5 to #7C3AED), text 'Masuk ke Sistem'. Clean typography using Inter font."*

---

### SCREEN 2: Admin Dashboard (Overview & Analytics)
#### A. Layout & Hierarchy
```text
+----------+--------------------------------------------------+
| Sidebar  | Header: Dashboard Overview | 24 Nov 2026 | User  |
|          +--------------------------------------------------+
| Logo     | [KPI 1: Pemasukan]   [KPI 2: Pengeluaran]        |
| - Dash*  | Rp 48.500.000        Rp 32.100.000               |
| - Kasir  | [KPI 3: Laba Bersih] [KPI 4: Alert Stok Tipis]   |
| - Stok   | Rp 16.400.000        5 Produk Perlu Kulakan      |
| - Kulak  +--------------------------------------------------+
| - Lapor  | [ Chart: Arus Kas Bulanan ] | [ Donut: Kategori] |
|          +-----------------------------+--------------------+
| [Logout] | [ Alert Table: Produk Stok Menipis < Minimum ]   |
+----------+--------------------------------------------------+
```
#### B. Stitch Prompt (Copy-Paste)
> **Prompt for Google Stitch:**
> *"Design a comprehensive dark-mode SaaS Admin Dashboard for a supermarket POS and inventory system named 'Swalayan POS'. Left sidebar navigation (260px, #111827) containing logo, navigation items with icons (Dashboard active with indigo glow, POS Kasir, Manajemen Produk, Kulakan/Restock, Laporan Keuangan, Kelola User). Top navigation bar displaying page title 'Ringkasan Toko', current date badge, low stock bell icon, and user profile. Main canvas features: 4 metric stat cards in a grid: (1) Total Pemasukan with green trend arrow +12%, (2) Total Pengeluaran with red trend indicator, (3) Laba Bersih Bulan Ini with violet gradient accent, (4) Peringatan Stok Kritis with amber badge. Below stats: Main area contains a dual-bar chart showing monthly Income vs Expense comparison and a donut chart of top selling product categories. Bottom section contains a dark data card listing 'Peringatan Stok Menipis' with product name, current stock quantity in red/orange badges, minimum threshold, and a '+ Kulakan' quick action button."*

---

### SCREEN 3: Point of Sale (POS) Cashier Screen
#### A. Layout & Hierarchy
```text
+----------+-----------------------------------+--------------+
| Sidebar  | Search Bar [ Cari nama / barcode ]| KERANJANG    |
| (compact)| Filter: [Semua][Sembako][Minuman] | 4 Items      |
|          +-----------------------------------+--------------+
|          | Product Grid (3x3 Cards):         | Item 1  x2   |
|          | +-------------+  +--------------+ | Subtotal     |
|          | | [IMG] Beras |  | [IMG] Minyak | | Item 2  x1   |
|          | | Rp 68.000   |  | Rp 34.000    | | Subtotal     |
|          | | Stok: 45    |  | Stok: 20     | | ------------ |
|          | | [+ Tambah]  |  | [+ Tambah]   | | Total:       |
|          | +-------------+  +--------------+ | Rp 170.000   |
|          |                                   | Bayar: [   ] |
|          |                                   | Kembali:     |
|          |                                   | [ PROSES ]   |
+----------+-----------------------------------+--------------+
```
#### B. Stitch Prompt (Copy-Paste)
> **Prompt for Google Stitch:**
> *"Design a modern, high-efficiency Point of Sale (POS) Cashier screen for a retail supermarket web app in dark theme. Split-screen layout: LEFT PANEL (65% width) has a top search bar with barcode scanner icon, horizontal pill tags for category filter ('Semua', 'Sembako', 'Makanan Ringan', 'Minuman', 'Perlengkapan Mandi'), followed by a responsive grid of product cards. Each product card has a clean product thumbnail, product name, SKU tag, stock counter badge, selling price in bold green text, and a '+' add to cart button. RIGHT PANEL (35% width) is a dedicated glassmorphism checkout receipt container (#111827) with header 'Keranjang Belanja'. Displays list of added items with interactive quantity stepper (- / +), individual subtotal, and trash icon. Bottom calculation area shows: Subtotal, Pajak/Diskon, Grand Total in prominent 24px typography, numeric input for 'Nominal Tunai Diterima', automatically calculated 'Kembalian', and a large emerald-green button 'Selesaikan Transaksi & Cetak Struk'."*

---

### SCREEN 4: Product & Stock Management
#### A. Layout & Hierarchy
```text
+----------+--------------------------------------------------+
| Sidebar  | Header: Manajemen Produk & Stok | [+ Tambah Produk]
|          +--------------------------------------------------+
|          | Filter: [Search SKU/Nama] [Kategori v] [Stok v]  |
|          +--------------------------------------------------+
|          | Data Table:                                      |
|          | [x] SKU   | Nama Produk | Kategori | Modal | Jual|
|          | [ ] BRG01 | Beras 5kg   | Sembako  | 60k   | 68k |
|          | [ ] BRG02 | Minyak 2L   | Sembako  | 28k   | 34k |
|          | [ ] BRG03 | Gula 1kg    | Sembako  | 14k   | 17k |
|          | Stok: [ 45 - Aman ] | Aksi: [Edit] [Hapus]       |
|          |                                                  |
|          | Pagination: Menampilkan 1-10 dari 124 produk     |
+----------+--------------------------------------------------+
```
#### B. Stitch Prompt (Copy-Paste)
> **Prompt for Google Stitch:**
> *"Design an enterprise-grade dark-themed Product and Inventory Management table view for a supermarket system. Top bar has page title 'Katalog & Stok Barang' with an indigo primary button '+ Tambah Produk Baru' and 'Export Excel' button. Below the header: filter toolbar with full-text search input, category dropdown selector, and stock status filter ('Semua', 'Stok Aman', 'Stok Menipis', 'Habis'). Main content is a sleek data table with sticky header, alternating subtle dark row highlights (#111827 and #162032). Columns: Checkbox, SKU Code (JetBrains mono tag), Nama Produk with small thumbnail, Kategori, Harga Beli (Rp), Harga Jual (Rp), Margin Keuntungan (%), Status Stok with color-coded pill badge (Green for 'Aman', Yellow for 'Menipis', Red for 'Habis'), and Action column with discrete icon buttons (Eye, Edit Pencil, Delete Trash). Footer features pagination with page numbers and items-per-page selector."*

---

### SCREEN 5: Restock / Kulakan (Purchase Entry Form)
#### A. Layout & Hierarchy
```text
+----------+--------------------------------------------------+
| Sidebar  | Header: Form Pembelian Kulakan Stok | [Simpan Transaksi]
|          +--------------------------------------------------+
|          | Card 1: Informasi Nota                           |
|          | Supplier: [ CV Jaya Makmur v ]   Tanggal: [DatePicker]
|          | No. Faktur: [ INV-2026-001  ]   Catatan: [       ]
|          +--------------------------------------------------+
|          | Card 2: Rincian Barang Masuk                     |
|          | Produk           | Qty | Harga Beli | Subtotal   |
|          | [Beras 5kg    v] | 20  | 60.000     | 1.200.000  |
|          | [Minyak Gorengv] | 50  | 28.000     | 1.400.000  |
|          | [+ Tambah Baris Barang]                          |
|          +--------------------------------------------------+
|          | Total Pengeluaran Kulakan: Rp 2.600.000          |
+----------+--------------------------------------------------+
```
#### B. Stitch Prompt (Copy-Paste)
> **Prompt for Google Stitch:**
> *"Design a multi-step structured restock purchase form ('Form Kulakan Barang') for a supermarket inventory software in dark mode. Top bar shows page title 'Tambah Transaksi Kulakan' and action buttons: 'Batal' and primary 'Simpan & Update Stok'. Two structured cards on canvas: Card 1 (General Information): 3-column form layout with Supplier Select dropdown (with quick '+ Supplier Baru' link), Invoice/Faktur number textfield, purchase datepicker, and optional note textarea. Card 2 (Itemized Inventory Entry): dynamic multi-row table where users can add multiple incoming items. Columns: Produk autocomplete dropdown, Jumlah Qty input with unit tag (pcs/dus), Harga Beli Satuan (numeric currency input), Subtotal (automatically calculated read-only), and red remove row icon button. Below the table: a dashed secondary button '+ Tambah Baris Barang'. Bottom right summary box displays Total Biaya Kulakan in large red/rose highlight font, indicating an outflow expense from the cash register."*

---

### SCREEN 6: Financial Cash Flow & Profit/Loss Report
#### A. Layout & Hierarchy
```text
+----------+--------------------------------------------------+
| Sidebar  | Header: Laporan Arus Kas & Laba Rugi | [Export PDF]
|          +--------------------------------------------------+
|          | Date Filter: [ 01/11/2026 ] s/d [ 30/11/2026 ] [Terapkan]
|          +--------------------------------------------------+
|          | [ Card: Pemasukan ] [ Card: Pengeluaran ] [ Laba Bersih ]
|          | Rp 84.200.000       Rp 58.600.000         Rp 25.600.000
|          | (Dari Penjualan)    (Kulakan & Operasi)   (+30.4% Margin)
|          +--------------------------------------------------+
|          | Buku Kas (Cashflow Ledger Table):                |
|          | Tanggal    | Tipe Transaksi | Ref  | Debit | Kredit
|          | 24/11/2026 | [Penjualan POS]| TRX01| 450k  | -     |
|          | 24/11/2026 | [Kulakan Stok] | KLK04| -     | 1.200k|
|          | 23/11/2026 | [Operasional]  | OPR02| -     | 150k  |
+----------+--------------------------------------------------+
```
#### B. Stitch Prompt (Copy-Paste)
> **Prompt for Google Stitch:**
> *"Design an executive Financial Report & Cash Flow Ledger ('Laporan Arus Kas & Laba Rugi') interface for a supermarket management web app in dark mode. Top controls bar features a date range picker with presets ('Hari Ini', 'Bulan Ini', 'Tahun Ini'), a filter submit button, and an 'Export PDF / Print' button with printer icon. Directly underneath, 3 high-impact summary metric cards: (1) Total Pemasukan Kas (green accent with glowing outline), (2) Total Pengeluaran Kas (red/pink accent showing restock costs and operational utilities), (3) Laba Bersih / Net Profit (indigo accent with percentage profit margin badge). Below metrics: a detailed cash flow ledger table with columns: Tanggal & Waktu, Jenis Arus Kas (badge: green 'Penjualan', red 'Kulakan Stok', orange 'Biaya Operasional'), No. Referensi, Keterangan Transaksi, Kas Masuk (Debit in green), Kas Keluar (Kredit in red), and running Saldo Akumulatif in bold white text."*

---

## 4. Panduan Penggunaan di Google Stitch

1. Buka workspace **Google Stitch** atau antarmuka generator UI yang kamu gunakan.
2. Atur preferensi tema ke **Dark Mode** / **SaaS Application**.
3. Buka salah satu section di atas (Screen 1 hingga 6).
4. Salin teks pada bagian **Stitch Prompt (Copy-Paste)** dan masukkan ke kotak prompt Stitch.
5. Gunakan tabel **Color Palette & Tokens** di Bagian 1 jika Stitch meminta konfigurasi *Design Tokens / Style Guide* kustom.
