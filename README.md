# Permohonan Pembayaran & Nota

Aplikasi web untuk input perjalanan dinas harian, hitung allowance otomatis, dan export Excel + Word di akhir bulan.

## ✨ Fitur

- 📅 **Input harian**: setiap selesai trip, langsung input. Akhir bulan tinggal export.
- 🧮 **Auto-hitung allowance**:
  - Pulang hari: Rp 125.000
  - Menginap: Rp 300.000 × jumlah malam (otomatis dari selisih tanggal)
- 📊 **Export Excel** format "Permohonan Pembayaran" — semua entry bulan terpilih otomatis terkumpul
- 📷 **Export Word** kumpulan foto nota dengan label tanggal (2 kolom per halaman)
- 💾 **Auto-save** ke browser (localStorage), plus backup/restore JSON
- 📲 **PWA** — bisa di-install ke home screen Android/iOS, jalan offline
- 🖼 **Foto auto-compress** (max 900px, JPEG 72%) — hemat storage

---

## 🚀 Cara Deploy ke GitHub Pages

### 1) Buat repo di GitHub

1. Buka https://github.com/new
2. Repository name: `permohonan-app` (atau bebas)
3. Pilih **Public**
4. ✅ Centang **"Add a README file"** (opsional, biar repo gak kosong)
5. Klik **Create repository**

### 2) Upload semua file

**Cara mudah (lewat web browser):**

1. Di halaman repo, klik **Add file → Upload files**
2. Drag & drop **semua file** dari folder ini:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
   - `README.md` (file ini)
3. Scroll ke bawah, klik **Commit changes**

**Cara lewat git (kalau familiar):**

```bash
git clone https://github.com/USERNAME/permohonan-app.git
cd permohonan-app
# copy semua file ke folder ini
git add .
git commit -m "Initial commit"
git push
```

### 3) Aktifkan GitHub Pages

1. Di repo, klik tab **Settings** (di kanan atas)
2. Sidebar kiri → **Pages**
3. Bagian **Source**, pilih:
   - Branch: `main`
   - Folder: `/ (root)`
4. Klik **Save**
5. Tunggu 1-2 menit. URL akan muncul di atas: `https://USERNAME.github.io/permohonan-app/`

### 4) Buka di HP & install sebagai app

**Android (Chrome):**
1. Buka URL `https://USERNAME.github.io/permohonan-app/`
2. Banner "Install app" muncul → klik **Install**
3. Atau menu Chrome (⋮) → **Install app**
4. Icon "Permohonan" muncul di home screen

**iPhone (Safari):**
1. Buka URL di Safari (HARUS Safari, bukan Chrome iOS)
2. Tap tombol **Share** (kotak dengan panah ke atas)
3. Scroll → **Add to Home Screen**
4. Tap **Add**

Setelah install, app jalan layaknya app native — fullscreen, tanpa address bar, dan **bisa offline** setelah dibuka pertama kali.

---

## 📖 Cara Pakai

### Setup awal (sekali aja)

1. Buka app
2. Buka **⚙️ Pengaturan** → isi:
   - Pengajuan bulan ini (mis. `3000000`)
   - Nama Pembuat (mis. `Leo`)
   - Lokasi (mis. `Solo`)

### Input harian

Setiap selesai trip:

1. Tap **+ Tambah Entry Perjalanan**
2. Pilih tipe:
   - 🚗 **Pulang Hari** (Rp 125rb)
   - 🏨 **Menginap** (Rp 300rb/malam)
3. Pilih tanggal berangkat (& pulang kalau menginap)
4. Isi **Nama Trip** (mis. `Wonogiri`, `JV Marketing`)
5. Tambah **Biaya Lain** kalau ada (BBM, Tiket Kereta, Parkir, Travel)
6. Tambah **Tujuan** (RS yang dikunjungi) + aktivitas yang dikerjakan
7. Upload **Foto Nota** — label otomatis dari tanggal, bisa edit
8. Tap **💾 Simpan**

⏱ ~30 detik per entry.

### Akhir bulan

1. Pilih bulan dari dropdown atas (mis. `April 2026`)
2. Tap **📊 Excel** → file `Permohonan_April_2026.xlsx` ke-download
3. Tap **📷 Word** → file `Nota_April_2026.docx` (kumpulan foto) ke-download
4. Bulan baru: tap **+ Bulan baru** → isi `2026-05`

### Backup data

Storage browser bisa hilang kalau:
- Cache HP dibersihkan
- Re-install browser
- Ganti HP

**Saran**: tiap akhir minggu, tap **💾 Backup** → simpan file JSON ke Google Drive / WhatsApp ke diri sendiri. Untuk restore, tap **📂 Restore** → pilih file JSON.

---

## 🔧 Update App

Kalau ada perubahan kode:

1. Edit/upload file baru ke GitHub
2. Tunggu 1-2 menit (GitHub Pages rebuild)
3. **PENTING**: di sw.js, ganti `CACHE_NAME = 'permohonan-v2'` jadi `'permohonan-v3'`, dst. — biar service worker tau ada update dan refresh cache
4. Di HP: tutup app, buka lagi (atau reload). Update otomatis ke-pull.

---

## 📦 Struktur File

```
permohonan-app/
├── index.html       # App utama (HTML + JS + CSS jadi satu)
├── manifest.json    # PWA metadata
├── sw.js            # Service worker (offline support)
├── icon-192.png     # Icon home screen
├── icon-512.png     # Icon Play Store / install prompt
└── README.md        # File ini
```

## 🛠 Teknologi

- **Vanilla JS** — no framework, no build step
- **localStorage** — penyimpanan data
- **SheetJS (xlsx)** — generate Excel
- **JSZip** — generate Word docx (manual XML)
- **PWA** (Service Worker + Manifest) — install & offline

## 📝 Catatan

- Excel keluaran tidak bold otomatis di kolom Keterangan (keterbatasan SheetJS gratisan). Kalau perlu bold, format manual di Excel — atau upgrade ke ExcelJS.
- Tarif allowance hardcoded sesuai aturan: 125rb pulang hari, 300rb/malam menginap. Untuk ubah ke 350rb (Supervisor) atau 500rb (Manager), edit fungsi `getAllowance()` di `index.html`.
