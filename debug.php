<?php
// Debug Database Connection and Check Updates
require_once 'config.php';

echo "<h2>Database Debug Info</h2>";

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "✓ Database connected successfully<br><br>";

// Check table structure
echo "<h3>Table Structure:</h3>";
$result = $conn->query("DESCRIBE qr_codes");
echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
while($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . $row['Field'] . "</td>";
    echo "<td>" . $row['Type'] . "</td>";
    echo "<td>" . $row['Null'] . "</td>";
    echo "<td>" . $row['Key'] . "</td>";
    echo "<td>" . $row['Default'] . "</td>";
    echo "<td>" . $row['Extra'] . "</td>";
    echo "</tr>";
}
echo "</table><br>";

// Show all records
echo "<h3>All QR Codes in Database:</h3>";
$result = $conn->query("SELECT * FROM qr_codes ORDER BY created_at DESC");
echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>ID</th><th>Code</th><th>Name</th><th>Description</th><th>Scanned At</th><th>Is Used</th><th>Created At</th></tr>";

if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['code'] . "</td>";
        echo "<td>" . $row['name'] . "</td>";
        echo "<td>" . $row['description'] . "</td>";
        echo "<td>" . ($row['scanned_at'] ?? 'NULL') . "</td>";
        echo "<td>" . $row['is_used'] . "</td>";
        echo "<td>" . $row['created_at'] . "</td>";
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='7'>No records found</td></tr>";
}
echo "</table><br>";

// Test UPDATE query
echo "<h3>Test Update Query:</h3>";
$testId = 1;
$stmt = $conn->prepare("UPDATE qr_codes SET scanned_at = NOW() WHERE id = ?");
$stmt->bind_param("i", $testId);
if($stmt->execute()) {
    echo "✓ UPDATE query works<br>";
    echo "Affected rows: " . $stmt->affected_rows . "<br>";
} else {
    echo "✗ UPDATE query failed: " . $stmt->error . "<br>";
}

$conn->close();
?>
