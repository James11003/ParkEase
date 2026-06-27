<?php
include "../config/db.php";
include "../config/auth.php";
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$data = json_decode(file_get_contents("php://input"), true);

$name           = trim($data['name']           ?? '');
$email          = trim($data['email']          ?? '');
$password       = $data['password']            ?? '';
$vehicle_number = trim($data['vehicle_number'] ?? '');
$vehicle_type   = $data['vehicle_type']        ?? '';

// Validation
if (!$name || !$email || !$password || !$vehicle_number || !$vehicle_type) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters"]);
    exit;
}

// Check duplicate email
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    exit;
}

// Hash password — never store plain text
$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $name, $email, $hashed, $vehicle_number, $vehicle_type);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Registered successfully! Please login."]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed. Try again."]);
}
