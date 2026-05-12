# Fitur Gamifikasi pada Aplikasi Simakin

## Pendahuluan

Simakin adalah platform berbasis web untuk membantu pengguna menghafal Al-Qur'an menggunakan pendekatan gamifikasi. Gamifikasi diterapkan untuk meningkatkan motivasi dan konsistensi pengguna dalam berlatih. Terdapat enam komponen utama gamifikasi dalam aplikasi ini: **Sistem EXP (Poin Pengalaman)**, **Sistem Streak**, **Minigame Interaktif**, **Tantangan Harian**, **Pencapaian (Achievement)**, dan **Papan Peringkat (Leaderboard)**.

---

## 1. Sistem EXP (Poin Pengalaman)

Setiap aktivitas yang dilakukan pengguna di dalam Simakin menghasilkan poin EXP. EXP berfungsi sebagai ukuran kemajuan pengguna dan terakumulasi sebagai total skor di profil.

### Sumber EXP

| Aktivitas | EXP yang Diperoleh |
|---|---|
| Menyelesaikan sesi muroja'ah/ziyadah | Dihitung dari skor akurasi, tajwid, dan kelancaran |
| Menyelesaikan minigame | Bergantung pada jenis game dan jumlah jawaban benar |
| Menyelesaikan tantangan harian | Bonus tetap per tantangan |

### Formula Perhitungan EXP (Sesi Hafalan)

```
EXP = Skor Dasar × 5 × Multiplier Streak × Multiplier Mode × Multiplier Panjang Ayat
```

**Skor Dasar** = rata-rata dari tiga nilai AI: akurasi, tajwid, dan kelancaran.

**Multiplier:**
- **Streak**: 1.0× (0–2 hari) → 1.25× (3–6 hari) → 1.5× (7–13 hari) → 2.0× (≥14 hari)
- **Mode**: Ziyadah (hafalan baru) 1.3×, Muroja'ah (pengulangan) 1.0×
- **Panjang**: 1–4 ayat 1.0×, 5–9 ayat 1.1×, 10–19 ayat 1.2×, ≥20 ayat 1.5×

---

## 2. Sistem Streak

Streak adalah penghitung hari berturut-turut pengguna melakukan aktivitas (sesi hafalan maupun minigame). Sistem ini dirancang timezone-aware menggunakan timezone yang tersimpan di profil pengguna (default: Asia/Jakarta).

### Aturan Streak

| Kondisi | Hasil |
|---|---|
| Aktivitas di hari yang sama | Tidak ada perubahan |
| Aktivitas di hari berikutnya (selisih 1 hari) | Streak bertambah 1 |
| Lebih dari 1 hari tidak aktif | Streak direset ke 1 |

Streak yang tinggi memberikan multiplier EXP lebih besar, sehingga mendorong pengguna untuk aktif setiap hari.

---

## 3. Minigame Interaktif

Minigame adalah fitur utama pada halaman Game. Tersedia empat jenis permainan yang masing-masing melatih aspek berbeda dari hafalan Al-Qur'an. Setiap game terdiri dari **10 soal** dengan **waktu 15 detik per soal**.

### Halaman Utama Game

Halaman ini menampilkan pilihan game, statistik singkat pengguna (total skor, jumlah achievement, streak), serta daftar tantangan harian.

![Halaman Utama Game](<../public/images/game/game-page.png>)

---

### 3.1 Tebak Surah

**Deskripsi:** Pengguna ditampilkan satu atau dua ayat Al-Qur'an, lalu diminta menebak surah asal dari ayat tersebut.

**Tujuan:** Melatih kemampuan mengenali ayat dan menghubungkannya dengan nama surahnya.

**Sistem Penilaian:**
- Setiap jawaban benar: +5 EXP
- Bonus penyelesaian: +20 EXP
- Bonus sempurna (10/10): +50 EXP tambahan
- Menang jika menjawab benar ≥7 dari 10 soal

**Tampilan Jawaban Benar:**

![Tebak Surah - Jawaban Benar](<../public/images/game/tebak-surat/tebak-surat (jawaban-benar).png>)

**Tampilan Jawaban Salah:**

![Tebak Surah - Jawaban Salah](<../public/images/game/tebak-surat/tebak-surat (jawaban-salah).png>)

**Tampilan Hasil:**

![Tebak Surah - Hasil](<../public/images/game/tebak-surat/tebak-surat-result.png>)

---

### 3.2 Sambung Ayat

**Deskripsi:** Pengguna ditampilkan sebuah ayat, lalu diminta memilih ayat mana yang melanjutkan ayat tersebut dari empat pilihan yang tersedia.

**Tujuan:** Melatih kemampuan mengingat urutan dan kesinambungan ayat-ayat Al-Qur'an.

**Sistem Penilaian:**
- Setiap jawaban benar: +10 EXP
- Bonus penyelesaian: +20 EXP
- Bonus sempurna (10/10): +50 EXP tambahan
- Menang jika menjawab benar ≥7 dari 10 soal

**Tampilan Jawaban Benar:**

![Sambung Ayat - Jawaban Benar](<../public/images/game/sambung-ayat/sambung-ayat (jawaban-benar).png>)

**Tampilan Jawaban Salah:**

![Sambung Ayat - Jawaban Salah](<../public/images/game/sambung-ayat/sambung-ayat (jawaban-salah).png>)

**Tampilan Hasil:**

![Sambung Ayat - Hasil](<../public/images/game/sambung-ayat/sambung-ayat-result.png>)

---

### 3.3 Urutan Ayat

**Deskripsi:** Pengguna diberikan beberapa ayat yang urutannya telah diacak, lalu diminta mengidentifikasi ayat mana yang merupakan ayat **pertama** di antara pilihan yang ada.

**Tujuan:** Melatih pemahaman tentang urutan ayat dalam suatu surah.

**Sistem Penilaian:**
- Setiap jawaban benar: +10 EXP
- Bonus penyelesaian: +20 EXP
- Bonus sempurna (10/10): +50 EXP tambahan
- Menang jika menjawab benar ≥7 dari 10 soal

**Tampilan Jawaban Benar:**

![Urutan Ayat - Jawaban Benar](<../public/images/game/urutan-ayat/urutan-ayat (jawaban-benar).png>)

**Tampilan Jawaban Salah:**

![Urutan Ayat - Jawaban Salah](<../public/images/game/urutan-ayat/urutan-ayat (jawaban-salah).png>)

**Tampilan Hasil:**

![Urutan Ayat - Hasil](<../public/images/game/urutan-ayat/urutan-ayat-result.png>)

---

### 3.4 Lengkapi Ayat

**Deskripsi:** Pengguna ditampilkan sebuah ayat dengan satu kata yang dikosongkan (`___`), lalu diminta memilih kata yang tepat untuk mengisi kekosongan tersebut.

**Tujuan:** Melatih ketepatan hafalan pada tingkat kata per kata dalam sebuah ayat.

**Sistem Penilaian:**
- Setiap jawaban benar: +20 EXP (EXP tertinggi karena kesulitan paling tinggi)
- Bonus penyelesaian: +20 EXP
- Bonus sempurna (10/10): +50 EXP tambahan
- Menang jika menjawab benar ≥7 dari 10 soal

**Tampilan Jawaban Benar:**

![Lengkapi Ayat - Jawaban Benar](<../public/images/game/lengkapi-ayat/lengkapi-ayat (jawaban-benar).png>)

**Tampilan Jawaban Salah:**

![Lengkapi Ayat - Jawaban Salah](<../public/images/game/lengkapi-ayat/lengkapi-ayat (jawaban salah).png>)

**Tampilan Hasil:**

![Lengkapi Ayat - Hasil](<../public/images/game/lengkapi-ayat/lengkapi-ayat-result.png>)

---

### Mekanisme Umum Minigame

Semua minigame berbagi mekanisme berikut:

- **Timer per soal**: Setiap soal diberi waktu 15 detik. Jika waktu habis, soal dianggap salah dan game berlanjut ke soal berikutnya secara otomatis.
- **Feedback langsung**: Setelah memilih jawaban, pilihan yang benar langsung ditandai hijau dan pilihan yang salah ditandai merah, sehingga pengguna dapat belajar dari kesalahannya.
- **Skor akhir**: Setelah 10 soal selesai, pengguna langsung melihat ringkasan hasil berupa jumlah jawaban benar, EXP yang diperoleh, dan status menang/kalah.
- **Update data otomatis**: Setiap penyelesaian game secara otomatis memperbarui streak harian, progres tantangan harian, dan memeriksa apakah ada achievement baru yang terbuka.

---

## 4. Tantangan Harian

Tantangan harian memberikan tujuan konkret yang harus diselesaikan setiap hari. Terdapat tiga jenis tantangan yang tersedia, dan semua tantangan direset setiap hari pada tengah malam (berdasarkan timezone pengguna).

| Tantangan | Deskripsi | Hadiah EXP |
|---|---|---|
| **Mainkan Game** | Selesaikan sejumlah sesi minigame hari ini | Bonus EXP |
| **Menangkan Game** | Raih kemenangan (≥7/10 benar) dalam minigame | Bonus EXP |
| **Capai Akurasi Tinggi** | Raih skor akurasi ≥90 dalam sesi hafalan | Bonus EXP |

Progress setiap tantangan ditampilkan dengan **progress bar** pada halaman Game. Saat tantangan selesai, tampilannya berubah menjadi hijau dengan tanda centang sebagai konfirmasi.

---

## 5. Pencapaian (Achievement)

Achievement adalah penghargaan yang diberikan kepada pengguna ketika mereka mencapai milestone tertentu. Achievement bersifat permanen — sekali diraih, tidak akan hilang. Pengguna dapat melihat semua achievement (yang sudah diraih maupun yang belum) di halaman Pencapaian.

### Daftar Achievement

| Achievement | Kondisi |
|---|---|
| **Langkah Pertama** | Menyelesaikan sesi hafalan pertama |
| **Gamer Pemula** | Menyelesaikan sesi minigame pertama |
| **Rajin Berlatih** | Menyelesaikan 10 sesi hafalan |
| **Hafiz Berdedikasi** | Menyelesaikan 50 sesi hafalan |
| **Pejuang Game** | Menyelesaikan 10 sesi minigame |
| **Jago Game** | Menang dalam 10 sesi minigame |
| **Sempurna!** | Menjawab semua 10 soal dengan benar dalam satu sesi game |
| **Streak Pemula** | Mempertahankan streak 7 hari berturut-turut |
| **Streak Master** | Mempertahankan streak 30 hari berturut-turut |
| **Kolektor Skor** | Mengumpulkan total skor 1.000 poin |
| **Sultan EXP** | Mengumpulkan total skor 10.000 poin |

Achievement yang belum diraih ditampilkan dalam kondisi terkunci, sehingga pengguna mengetahui target apa yang perlu dicapai.

---

## 6. Papan Peringkat (Leaderboard)

Papan peringkat memperlihatkan peringkat pengguna dibandingkan pengguna lain, sehingga mendorong kompetisi sehat di antara sesama pengguna Simakin.

### Dua Mode Tampilan

| Mode | Keterangan |
|---|---|
| **Global** | Peringkat berdasarkan total skor akumulatif sepanjang masa |
| **Mingguan** | Peringkat berdasarkan EXP yang dikumpulkan dalam 7 hari terakhir |

Peringkat 1–3 teratas mendapatkan tampilan khusus (medal emas, perak, perunggu). Pengguna yang sedang login selalu dapat melihat posisi peringkatnya sendiri meskipun tidak masuk dalam 10 besar.

---

## Ringkasan

Implementasi gamifikasi pada Simakin dirancang untuk:

1. **Mendorong konsistensi** — Sistem streak dan tantangan harian mendorong pengguna untuk aktif setiap hari.
2. **Memberikan umpan balik langsung** — Setiap jawaban dalam game langsung menampilkan hasil benar/salah, dan setiap sesi hafalan langsung memberikan skor dari AI.
3. **Menciptakan rasa pencapaian** — Achievement dan leaderboard memberikan rasa bangga dan motivasi untuk terus berkembang.
4. **Menyesuaikan tingkat kesulitan** — Empat minigame dengan bobot EXP berbeda memberikan variasi dan tantangan yang meningkat secara bertahap.
5. **Mengintegrasikan gamifikasi dengan pembelajaran** — EXP tidak hanya dari game, tetapi juga dari sesi hafalan nyata, sehingga gamifikasi mendukung—bukan menggantikan—proses belajar inti.
