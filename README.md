# JejakBelajar

Aplikasi web interaktif untuk mencatat dan melacak aktivitas belajar harian dengan fitur perencanaan dan timer fokus.

## Fitur Utama

### 📊 Dashboard
- **Personalisasi**: Input nama pengguna untuk pengalaman personal
- **Statistik Belajar**: 
  - Persentase progres belajar keseluruhan
  - Jumlah kursus/topik selesai
  - Total waktu belajar (jam)
  - Streak belajar harian dengan animasi 🔥
- **Jadwal Harian**: Manajemen topik pembelajaran dengan fitur tambah/hapus/reset
- **Timer Fokus**: Pomodoro timer dengan pilihan durasi (20/25/30 menit) dan notifikasi audio

### 📅 Perencana Belajar
- **Kalender Interaktif**: Tampilan bulanan dengan navigasi
- **Perencanaan Detail**: 
  - Pemilihan tanggal dan durasi
  - Gaya belajar (visual, auditory, kinesthetic)
  - Level prioritas (tinggi, sedang, rendah)
  - Deskripsi aktivitas belajar
- **Manajemen Rencana**: Tambah, edit, hapus, dan lihat detail rencana

### 📝 AktivitasKu (Halaman Terpisah)
- **Pelacakan Kegiatan**: Catatan detail aktivitas belajar dengan:
  - Jenis kegiatan (project, meeting, pembelajaran, presentasi, lainnya)
  - Prioritas dan status (belum dimulai, sedang dikerjakan, selesai)
  - Durasi dan catatan tambahan
- **Filter & Pencarian**: Filter berdasarkan status, prioritas, dan pencarian teks
- **Statistik**: Ringkasan total kegiatan, jam, dan progress keseluruhan
- **Manajemen Data**: Edit, hapus, dan bulk delete kegiatan

## Struktur File
- `index.html` – Dashboard utama dengan timer dan perencana belajar
- `kegiatan.html` – Halaman pelacakan aktivitas belajar terpisah
- `style.css` – Styling dengan glass morphism dan responsive design
- `script.js` – Logika aplikasi lengkap (2200+ baris)
- `bell100.mp3` – Efek audio untuk notifikasi timer

## Teknologi
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS + Custom CSS dengan glass morphism
- **Icons**: Font Awesome 6.4.0
- **Storage**: LocalStorage untuk penyimpanan data pengguna
- **UI/UX**: Responsive design, modal dialogs, toast notifications
- **Audio**: Web Audio API untuk notifikasi timer

## Instalasi & Penggunaan

### Cara 1: Live Server (Direkomendasikan)
```bash
git clone https://github.com/AmosZiliwu01/JejakBelajar.git
cd JejakBelajar/Aktivitas-Ku
# Jalankan dengan Live Server di VS Code atau editor lainnya
```

### Cara 2: Browser Langsung
1. Clone repository
2. Buka `https://amosziliwu01.github.io/JejakBelajar/` di browser modern
3. Masukkan nama pengguna
4. Mulai menggunakan dashboard dan fitur-fitur

## Fitur Lanjutan
- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Data Persistence**: Data tersimpan di browser menggunakan LocalStorage
- **Real-time Updates**: Perubahan data langsung terlihat di UI atau lakukan refresh browser
- **Accessibility**: Keyboard navigation dan screen reader support
- **Cross-browser**: Kompatibel dengan browser modern

## Lisensi
MIT License
