<?php
require_once 'config.php';

echo "<h2>Debug QR Codes Database</h2>";

$result = $conn->query("SELECT id, code, name, qr_image FROM qr_codes ORDER BY id DESC LIMIT 5");

echo "<table border='1' cellpadding='10'>";
echo "<tr><th>ID</th><th>Code</th><th>Name</th><th>QR Image Path</th><th>File Exists?</th><th>Image Preview</th></tr>";

while($row = $result->fetch_assoc()) {
    $fileExists = file_exists($row['qr_image']) ? '✅ YES' : '❌ NO';
    $imagePath = $row['qr_image'];
    
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . $row['code'] . "</td>";
    echo "<td>" . $row['name'] . "</td>";
    echo "<td>" . $imagePath . "</td>";
    echo "<td>" . $fileExists . "</td>";
    echo "<td>";
    if(file_exists($imagePath)) {
        echo "<img src='$imagePath' width='100'>";
    } else {
        echo "File not found";
    }
    echo "</td>";
    echo "</tr>";
}

echo "</table>";

$conn->close();
?>
