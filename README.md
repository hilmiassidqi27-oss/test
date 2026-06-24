# 🧠 MBTI Sync Pro

Aplikasi tes kepribadian MBTI berbasis web yang modern, responsif, dan dapat diakses oleh semua orang secara gratis.

🔗 **Live Demo:** `https://[username].github.io/mbti-sync-pro`

---

## ✨ Fitur Utama

- 📝 **24 Soal MBTI** yang seimbang mencakup semua 4 dimensi kepribadian (E/I, S/N, T/F, J/P)
- 📊 **Hasil Lengkap** — tipe MBTI, persentase aspek, deskripsi karakter, kekuatan, tantangan, dan rekomendasi karir
- 👤 **Form Pendaftar** — Nama, Email, dan No. WhatsApp tersimpan otomatis
- 🗄️ **Penyimpanan Lokal** — Data tersimpan di browser tanpa perlu server
- ☁️ **Firebase Opsional** — Bisa dihubungkan ke Firebase untuk sinkronisasi data real-time
- 📤 **Ekspor Excel/CSV** — Admin bisa mengunduh semua data responden
- 🔐 **Panel Admin** — Dashboard tersembunyi dengan password untuk melihat semua hasil

---

## 🚀 Cara Deploy ke GitHub Pages (Gratis)

### Langkah 1: Buat Repository GitHub
1. Login ke [github.com](https://github.com)
2. Klik tombol **"New"** untuk membuat repository baru
3. Beri nama repository, contoh: `mbti-sync-pro`
4. Centang **"Public"** agar bisa diakses semua orang
5. Klik **"Create repository"**

### Langkah 2: Upload File
**Cara A — Via Browser (Mudah):**
1. Di halaman repository, klik **"uploading an existing file"**
2. Drag & drop semua file dari folder ini
3. Klik **"Commit changes"**

**Cara B — Via Git (Terminal):**
```bash
git init
git add .
git commit -m "🚀 Initial commit - MBTI Sync Pro"
git branch -M main
git remote add origin https://github.com/[USERNAME]/mbti-sync-pro.git
git push -u origin main
```

### Langkah 3: Aktifkan GitHub Pages
1. Buka tab **"Settings"** di repository kamu
2. Scroll ke bawah, cari bagian **"Pages"** di menu kiri
3. Di bagian **"Source"**, pilih branch `main` dan folder `/ (root)`
4. Klik **"Save"**
5. Tunggu 1-2 menit, lalu akses di: `https://[USERNAME].github.io/[NAMA-REPO]`

---

## 🔥 Menghubungkan Firebase (Opsional)

Secara default, data tersimpan di **localStorage** browser. Untuk sinkronisasi cloud real-time:

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru → aktifkan **Firestore Database**
3. Buka `index.html`, cari bagian `firebaseConfig` (sekitar baris 66)
4. Ganti nilai-nilainya dengan konfigurasi Firebase kamu:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "project-id.firebaseapp.com",
    projectId: "project-id",
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

5. Di Firestore, set **Rules** menjadi:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mbti_submissions/{doc} {
      allow read, write: if true;
    }
  }
}
```

---

## 🔐 Akses Panel Admin

Buka aplikasi, lalu klik tulisan kecil **"Admin"** di sudut halaman, atau tambahkan `?admin=true` di URL.

- **Password default:** `adminmbti123`
- Fitur: lihat semua responden, ekspor data ke CSV/Excel

---

## 🛠️ Teknologi

| Teknologi | Fungsi |
|-----------|--------|
| React 18 | UI Framework |
| Tailwind CSS | Styling |
| Firebase Firestore | Database Cloud (opsional) |
| Babel Standalone | Kompilasi JSX di browser |
| localStorage | Penyimpanan lokal offline |

---

## 📁 Struktur File

```
mbti-sync-pro/
├── index.html       ← Aplikasi utama (satu file lengkap)
├── README.md        ← Panduan ini
└── .nojekyll        ← Agar GitHub Pages tidak memproses Jekyll
```

---

## 📄 Lisensi

Bebas digunakan dan dimodifikasi untuk keperluan pribadi maupun organisasi.

---

*© 2026 MBTI Sync Pro — Dibuat dengan ❤️ untuk komunitas Indonesia*
