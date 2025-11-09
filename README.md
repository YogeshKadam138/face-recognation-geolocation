# 🎯 Sistem Absensi Face Recognition

Sistem absensi modern dengan teknologi Face Recognition menggunakan Face-API.js dan TensorFlow.js yang dapat berjalan di berbagai perangkat termasuk Android (Termux).

## ✨ Fitur Utama

- ✅ Absensi menggunakan Face Recognition
- 📍 Deteksi lokasi otomatis dengan Geolocation
- 👤 CRUD Management untuk data siswa
- 📊 Dashboard admin lengkap
- 📈 Riwayat absensi dengan filter
- 🎨 UI/UX modern dengan desain #1E1E1E dan bubble biru
- 📱 Responsive untuk semua perangkat
- 🔒 Validasi kemiripan wajah >80%

## 📋 Requirements

- Node.js (v14 atau lebih tinggi)
- MySQL/MariaDB
- Browser modern dengan dukungan WebRTC

## 🚀 Instalasi

### 1. Persiapan Database

```bash
# Masuk ke MySQL
mysql -u root -p

# Import database schema
mysql -u root -p < database.sql
```

Atau jalankan manual:
```sql
CREATE DATABASE IF NOT EXISTS database_absensi;
USE database_absensi;
-- Copy isi dari database.sql
```

### 2. Install Dependencies

```bash
# Install npm packages
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` atau edit yang sudah ada:
```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=database_absensi
```

### 4. Download Face-API Models

Download model weights dari Face-API.js dan letakkan di folder `models/`:
- Download dari: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

File yang dibutuhkan:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1` & `face_recognition_model-shard2`

Atau gunakan wget/curl di Termux:
```bash
cd models
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

### 5. Buat Folder Uploads

```bash
mkdir uploads
```

## 🎮 Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server akan berjalan di: `http://localhost:3000`

## 📱 Khusus untuk Termux (Android)

### 1. Install Termux dari F-Droid
Download: https://f-droid.org/packages/com.termux/

### 2. Setup Termux

```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js dan MySQL
pkg install nodejs mariadb

# Setup MySQL
mysql_install_db
mysqld_safe -u root &
mysql -u root
```

### 3. Set Password MySQL (Optional)

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
```

### 4. Clone/Upload Project

Gunakan Acode untuk edit file atau upload via:
- Termux-storage
- Git clone
- Manual copy

### 5. Jalankan seperti biasa

```bash
cd /path/to/project
npm install
npm start
```

### 6. Akses dari Browser

Buka browser Android dan akses:
- `http://localhost:3000` atau
- `http://127.0.0.1:3000`

## 📂 Struktur Folder

```
project/
├── app.js              # Server utama
├── db.js               # Konfigurasi database
├── package.json        # Dependencies
├── .env                # Environment variables
├── database.sql        # SQL schema
├── public/             
│   ├── index.html      # Halaman absensi
│   └── dashboard.html  # Dashboard admin
├── models/             # Face-API weights
│   ├── tiny_face_detector_model-*
│   ├── face_landmark_68_model-*
│   └── face_recognition_model-*
└── uploads/            # Upload foto siswa
```

## 🎯 Cara Penggunaan

### Untuk Siswa (Absensi)

1. Buka `http://localhost:3000`
2. Masukkan username
3. Klik "Ambil Lokasi & Lanjutkan"
4. Izinkan akses lokasi dan kamera
5. Ambil foto wajah
6. Sistem akan memverifikasi dan menyimpan absensi

### Untuk Admin (Dashboard)

1. Buka `http://localhost:3000/dashboard.html`
2. **Pendaftaran Siswa:**
   - Isi username
   - Pilih kelas
   - Upload foto wajah
   - Klik "Daftar Siswa"
3. **Lihat Data:**
   - Tabel Data Siswa Terdaftar
   - Tabel Riwayat Absensi
4. **Filter:**
   - Filter absensi: Semua/Sukses/Gagal

## 🔧 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get user by username
- `POST /api/users` - Create new user (multipart/form-data)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Absensi
- `GET /api/absensi` - Get all attendance
- `GET /api/absensi?status=success` - Filter by status
- `POST /api/absensi` - Create attendance record
- `DELETE /api/absensi/:id` - Delete attendance

## 🎨 Desain

- Background: `#1E1E1E` (Dark theme)
- Accent: Blue gradient bubbles
- Responsive design untuk mobile & desktop
- Modern glassmorphism effect

## 🛠️ Troubleshooting

### Error: Cannot connect to database
```bash
# Pastikan MySQL berjalan
sudo service mysql start  # Linux
mysqld_safe -u root &      # Termux
```

### Error: Port already in use
```bash
# Ubah PORT di .env atau kill process
lsof -ti:3000 | xargs kill -9
```

### Error: Camera not accessible
- Pastikan menggunakan HTTPS atau localhost
- Izinkan akses kamera di browser
- Di Termux, gunakan Termux:API untuk akses kamera

### Face-API models not loading
- Pastikan folder `models/` berisi semua file weights
- Cek console browser untuk error loading
- Download ulang model jika corrupt

## 📝 Catatan Penting

1. **Keamanan:** Jangan expose API ke internet tanpa authentication
2. **Performa:** Face recognition butuh resources, test di device target
3. **Privacy:** Informasikan user tentang penggunaan face recognition
4. **Browser:** Gunakan Chrome/Firefox versi terbaru untuk hasil optimal
5. **Lighting:** Pastikan pencahayaan cukup saat foto untuk akurasi tinggi

## 🤝 Support

Jika ada masalah atau pertanyaan:
1. Check browser console untuk error
2. Check server log di terminal
3. Pastikan semua dependencies terinstall
4. Verifikasi database connection

## 📄 License

MIT License - Bebas digunakan untuk keperluan apapun

---

**Dibuat dengan ❤️ menggunakan Node.js, Face-API.js, dan TensorFlow.js**