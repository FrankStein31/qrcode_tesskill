# Sistem QR Code

Website sederhana untuk mengelola dan scan QR Code dengan fitur lengkap sesuai requirement.

## Fitur

### 1. Register QR Code (Nilai: 30)
- Generate QR Code secara RANDOM
- Scan menggunakan kamera untuk membaca QR Code

### 2. Scan QR Code
- Setelah register berhasil, kamera aktif untuk scan QR Code
- Setelah berhasil membaca QR Code, timer countdown 30 detik akan berjalan
- QR Code yang tidak terdaftar tidak dapat menjalankan timer (Nilai: 30)

### 3. Auto Mark as Used (Nilai: 40)
- Setelah countdown timer 30 detik habis, QR Code yang sudah digunakan secara otomatis tidak dapat digunakan kembali

## Instalasi

1. **Clone atau copy project ke folder Laragon**
   ```
   c:\laragon\www\qr_code
   ```

2. **Import database**
   - Buka phpMyAdmin (http://localhost/phpmyadmin)
   - Import file `database.sql`

3. **Install dependencies menggunakan Composer**
   ```bash
   composer install
   ```

4. **Buat folder untuk menyimpan QR Code**
   ```bash
   mkdir qrcodes
   ```

5. **Jalankan aplikasi**
   - Buka browser: http://localhost/qr_code
   - Izinkan akses kamera saat diminta

## Konfigurasi Database

Edit file `config.php` jika perlu mengubah konfigurasi database:
```php
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'qr_code_db';
```

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Backend**: PHP 7.4+
- **Database**: MySQL
- **QR Code Library**: Endroid QR Code
- **QR Scanner**: HTML5 QRCode Scanner

## Cara Penggunaan

1. **Register QR Code**:
   - Masukkan nama dan deskripsi
   - Klik "Generate QR Code"
   - QR Code akan dibuat secara random

2. **Scan QR Code**:
   - Izinkan akses kamera
   - Arahkan kamera ke QR Code
   - Sistem akan otomatis membaca dan memulai timer 30 detik

3. **Timer Countdown**:
   - Setelah scan berhasil, timer 30 detik akan berjalan
   - Setelah 30 detik, QR Code otomatis ditandai sebagai "digunakan"
   - QR Code yang sudah digunakan tidak dapat digunakan lagi

## Nilai/Skor Sistem

- **30**: QR Code berhasil di-scan (timer berjalan)
- **30**: QR Code tidak terdaftar tidak dapat menjalankan timer
- **40**: QR Code yang sudah digunakan tidak dapat digunakan kembali

## Troubleshooting

### Kamera tidak dapat diakses
- Pastikan browser memiliki izin akses kamera
- Gunakan HTTPS atau localhost
- Pastikan tidak ada aplikasi lain yang menggunakan kamera

### Database connection error
- Pastikan MySQL sudah berjalan
- Periksa konfigurasi di `config.php`
- Import ulang file `database.sql`

### Composer install gagal
- Pastikan Composer sudah terinstall
- Jalankan: `composer update`

## License

MIT License
