<?php
// Import Database Script
echo "Importing database...\n";

$host = 'localhost';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = file_get_contents('database.sql');

// Split SQL file into individual queries
$queries = array_filter(array_map('trim', explode(';', $sql)));

foreach ($queries as $query) {
    if (!empty($query)) {
        if ($conn->query($query) === TRUE) {
            echo "✓ Query executed successfully\n";
        } else {
            echo "✗ Error: " . $conn->error . "\n";
        }
    }
}

echo "\n✓ Database setup completed!\n";
echo "Database: qr_code_db\n";
echo "Table: qr_codes\n";

$conn->close();
?>
