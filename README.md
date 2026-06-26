# 🧠 MBTI Sync Pro

Aplikasi tes kepribadian MBTI — data tersimpan terpusat, bisa diakses dari device manapun.

---

## 🗄️ SETUP DATABASE (5 Menit, Gratis Selamanya)

Database menggunakan **JSONBin.io** — tidak perlu akun Google, tidak perlu kartu kredit.

---

### LANGKAH 1 — Daftar JSONBin.io

1. Buka **[jsonbin.io](https://jsonbin.io)**
2. Klik **"Sign Up"** → daftar dengan email
3. Verifikasi email, lalu login

---

### LANGKAH 2 — Buat API Key

1. Setelah login, klik menu **"API Keys"** di sidebar
2. Klik **"+ Create Access Key"**
3. Beri nama, contoh: `mbti-key`
4. **Salin API Key** yang muncul (dimulai dengan `$2a$10$...`)

---

### LANGKAH 3 — Buat Bin (Database)

1. Klik menu **"Bins"** → klik **"+ Create Bin"**
2. Di kolom JSON, isi dengan: `[]`
3. Klik **"Create"**
4. **Salin BIN ID** dari URL (contoh: URL `https://jsonbin.io/b/6675f3ab...` → BIN ID = `6675f3ab...`)

---

### LANGKAH 4 — Isi Config di index.html

Buka `index.html`, cari bagian ini (sekitar baris 72):

```javascript
const JSONBIN_CONFIG = {
    BIN_ID: "GANTI_BIN_ID",
    API_KEY: "GANTI_API_KEY",
};
```

Ganti dengan nilai asli Anda:

```javascript
const JSONBIN_CONFIG = {
    BIN_ID: "6675f3abc123def456...",   // ← BIN ID dari langkah 3
    API_KEY: "$2a$10$abc123...",        // ← API Key dari langkah 2
};
```

---

### LANGKAH 5 — Upload ke GitHub & Aktifkan Pages

1. Login [github.com](https://github.com) → **New** → nama: `mbti-sync-pro` → **Public** → **Create**
2. Klik **"uploading an existing file"** → drag & drop semua file → **Commit**
3. **Settings** → **Pages** → Source: `main` / `(root)` → **Save**
4. Akses di: `https://[username].github.io/mbti-sync-pro`

---

### ✅ Verifikasi Berhasil

1. Buka aplikasi → tekan **F12** → tab **Console**
2. Jika muncul: `✅ JSONBin database terhubung` → sukses!
3. Isi tes dari HP → buka admin di laptop → klik **Refresh** → data muncul ✓

---

## 🔐 Akses Admin

```
https://[username].github.io/mbti-sync-pro/?admin=true
```
Password: **`adminmbti123`**

---

*© 2026 MBTI Sync Pro*
