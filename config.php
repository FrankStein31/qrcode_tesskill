<?php
// Database Configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'qr_code_db';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");
