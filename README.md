# Sistem QR Code

Website sederhana untuk mengelola dan scan QR Code (Silahkan Dikembangkan Lebih Lanjut)

## Fitur

### 1. Register QR Code
- Generate QR Code secara RANDOM
- Scan menggunakan kamera untuk membaca QR Code

### 2. Scan QR Code
- Setelah register berhasil, kamera aktif untuk scan QR Code
- Setelah berhasil membaca QR Code, QR Code langsung ditandai sebagai "digunakan" (is_used = 1)
- QR Code yang tidak terdaftar tidak dapat di-scan

### 3. Auto Mark as Used
- Setelah scan berhasil, QR Code langsung ditandai sebagai "digunakan" di database
- QR Code yang sudah digunakan tidak dapat digunakan kembali
- User diminta untuk scan QR Code lain

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
   - Sistem akan otomatis membaca dan langsung menandai QR Code sebagai "digunakan"

3. **QR Code Sudah Digunakan**:
   - Setelah scan berhasil, QR Code langsung tidak dapat digunakan lagi
   - User diminta untuk scan QR Code yang lain
   - QR Code yang sama tidak dapat di-scan ulang

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

Frankie Steinlie