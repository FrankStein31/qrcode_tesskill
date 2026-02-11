<?php
header('Content-Type: application/json');
require_once 'config.php';
require_once 'vendor/autoload.php';

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

$action = $_GET['action'] ?? '';

switch($action) {
    case 'register':
        registerQRCode();
        break;
    case 'scan':
        scanQRCode();
        break;
    case 'markUsed':
        markAsUsed();
        break;
    case 'list':
        listQRCodes();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function registerQRCode() {
    global $conn;
    
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    
    if(empty($name)) {
        echo json_encode(['success' => false, 'message' => 'Nama harus diisi']);
        return;
    }
    
    // Generate random code
    $code = 'QR-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    
    // Generate QR Code
    $qrCode = new QrCode($code);
    $writer = new PngWriter();
    $result = $writer->write($qrCode);
    
    // Save QR Code image
    $qrImagePath = 'qrcodes/' . $code . '.png';
    if(!is_dir('qrcodes')) {
        mkdir('qrcodes', 0777, true);
    }
    $result->saveToFile($qrImagePath);
    
    // Save to database
    $stmt = $conn->prepare("INSERT INTO qr_codes (code, name, description, qr_image) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $code, $name, $description, $qrImagePath);
    
    if($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'code' => $code,
            'qr_image' => $qrImagePath,
            'message' => 'QR Code berhasil dibuat'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menyimpan ke database']);
    }
}

function scanQRCode() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $code = $data['code'] ?? '';
    
    if(empty($code)) {
        echo json_encode(['success' => false, 'message' => 'QR Code tidak valid']);
        return;
    }
    
    // Check if QR Code exists and not used
    $stmt = $conn->prepare("SELECT id, name, description, is_used FROM qr_codes WHERE code = ?");
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'QR Code tidak terdaftar']);
        return;
    }
    
    $qrData = $result->fetch_assoc();
    
    if($qrData['is_used'] == 1) {
        echo json_encode([
            'success' => false, 
            'message' => 'QR Code sudah pernah digunakan. QR Code yang sudah digunakan tidak dapat digunakan kembali'
        ]);
        return;
    }
    
    // Only update scanned_at, DON'T set is_used = 1 yet
    // is_used will be set to 1 after 30 seconds timer
    $stmt = $conn->prepare("UPDATE qr_codes SET scanned_at = NOW() WHERE id = ?");
    $stmt->bind_param("i", $qrData['id']);
    
    if(!$stmt->execute()) {
        echo json_encode([
            'success' => false, 
            'message' => 'Gagal update scanned_at: ' . $stmt->error
        ]);
        return;
    }
    
    // Verify update
    $stmt = $conn->prepare("SELECT scanned_at FROM qr_codes WHERE id = ?");
    $stmt->bind_param("i", $qrData['id']);
    $stmt->execute();
    $checkResult = $stmt->get_result();
    $updatedData = $checkResult->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'id' => $qrData['id'],
        'name' => $qrData['name'],
        'description' => $qrData['description'],
        'scanned_at' => $updatedData['scanned_at'],
        'message' => 'Scan berhasil! Timer 30 detik dimulai.'
    ]);
}

function markAsUsed() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    if($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
        return;
    }
    
    $stmt = $conn->prepare("UPDATE qr_codes SET is_used = 1 WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        // Check affected rows
        if($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true, 
                'message' => 'QR Code ditandai sebagai digunakan',
                'affected_rows' => $stmt->affected_rows
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Tidak ada data yang diupdate'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Gagal mengupdate status: ' . $stmt->error
        ]);
    }
}

function listQRCodes() {
    global $conn;
    
    $result = $conn->query("SELECT id, code, name, description, scanned_at, is_used, created_at FROM qr_codes ORDER BY created_at DESC");
    
    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
}
