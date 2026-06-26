# 🧠 MBTI Sync Pro

Aplikasi tes kepribadian MBTI berbasis web — responsif, real-time, dan dapat diakses siapa saja.

🔗 **Live Demo:** `https://[username].github.io/mbti-sync-pro`

---

## 🔥 PANDUAN SETUP FIREBASE (Database Terpusat)

Firebase memungkinkan semua data responden tersimpan di satu database cloud yang bisa diakses dari mana saja — laptop, HP, kantor, rumah — semuanya sinkron otomatis.

---

### LANGKAH 1 — Buat Akun & Project Firebase

1. Buka **[console.firebase.google.com](https://console.firebase.google.com)**
2. Login dengan akun Google Anda
3. Klik **"Add project"** / **"Tambahkan project"**
4. Isi nama project, contoh: `mbti-sync-pro`
5. Matikan Google Analytics (opsional) → klik **"Create project"**
6. Tunggu hingga project selesai dibuat → klik **"Continue"**

---

### LANGKAH 2 — Buat Database Firestore

1. Di sidebar kiri, klik **"Build"** → **"Firestore Database"**
2. Klik **"Create database"**
3. Pilih **"Start in test mode"** → klik **"Next"**
4. Pilih lokasi server terdekat (contoh: `asia-southeast1` untuk Indonesia)
5. Klik **"Enable"**

---

### LANGKAH 3 — Atur Rules Keamanan Firestore

1. Di halaman Firestore, klik tab **"Rules"**
2. Hapus semua teks yang ada, lalu paste ini:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mbti_submissions/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

3. Klik **"Publish"**

> Penjelasan: Siapapun bisa **mengirim** data (mengisi tes), tapi tidak bisa **membaca/menghapus** data orang lain. Hanya admin (via Firebase Console) yang bisa melihat semua data.

---

### LANGKAH 4 — Dapatkan Konfigurasi Firebase

1. Di sidebar kiri, klik ikon **⚙️ (Project Settings)**
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik ikon **`</>`** (Web App)
4. Isi nickname app, contoh: `mbti-web` → klik **"Register app"**
5. Anda akan melihat kode seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mbti-sync-pro-xxxxx.firebaseapp.com",
  projectId: "mbti-sync-pro-xxxxx",
  storageBucket: "mbti-sync-pro-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

6. **Salin semua nilai tersebut**

---

### LANGKAH 5 — Tempel Konfigurasi ke index.html

1. Buka file `index.html`
2. Cari bagian ini (sekitar baris 72):

```javascript
const firebaseConfig = {
    apiKey: "GANTI_API_KEY_ANDA",
    authDomain: "GANTI_PROJECT_ID.firebaseapp.com",
    projectId: "GANTI_PROJECT_ID",
    storageBucket: "GANTI_PROJECT_ID.appspot.com",
    messagingSenderId: "GANTI_SENDER_ID",
    appId: "GANTI_APP_ID"
};
```

3. Ganti seluruh nilai dengan konfigurasi dari Firebase Anda:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",           // ← paste nilai asli
    authDomain: "mbti-sync-pro-xxxxx.firebaseapp.com",
    projectId: "mbti-sync-pro-xxxxx",
    storageBucket: "mbti-sync-pro-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

4. Simpan file

---

### LANGKAH 6 — Upload ke GitHub & Aktifkan Pages

1. Login [github.com](https://github.com) → **New repository** → nama: `mbti-sync-pro` → **Public** → **Create**
2. Klik **"uploading an existing file"** → drag & drop semua file → **Commit changes**
3. **Settings** → **Pages** → Source: `main` / `(root)` → **Save**
4. Tunggu 1-2 menit → akses: `https://[username].github.io/mbti-sync-pro`

---

### ✅ Cara Verifikasi Firebase Terhubung

1. Buka aplikasi di browser
2. Tekan **F12** → tab **Console**
3. Jika muncul: `✅ Firebase terhubung: mbti-sync-pro-xxxxx` → berhasil!
4. Jika muncul: `⚠️ Firebase belum dikonfigurasi` → ulangi Langkah 5

---

## 🔐 Akses Panel Admin

Tambahkan `?admin=true` di URL:
```
https://[username].github.io/mbti-sync-pro/?admin=true
```

Password default: **`adminmbti123`**

---

## 📁 Struktur File

```
mbti-sync-pro/
├── index.html    ← Aplikasi utama
├── README.md     ← Panduan ini
├── .nojekyll     ← Untuk GitHub Pages
└── .gitignore
```

---

*© 2026 MBTI Sync Pro*
