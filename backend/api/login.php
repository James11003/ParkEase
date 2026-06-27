<?php
include "../config/db.php";
include "../config/auth.php";
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$data     = json_decode(file_get_contents("php://input"), true);
$email    = trim($data['email']    ?? '');
$password = $data['password']      ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();

// Generic error message — don't reveal whether email exists
if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    exit;
}

// Generate token and save to DB
$token  = bin2hex(random_bytes(32));
$update = $conn->prepare("UPDATE users SET auth_token = ? WHERE id = ?");
$update->bind_param("si", $token, $user['id']);
$update->execute();

echo json_encode([
    "success" => true,
    "token"   => $token,
    "user"    => [
        "id"             => $user['id'],
        "name"           => $user['name'],
        "email"          => $user['email'],
        "role"           => $user['role'],
        "vehicle_number" => $user['vehicle_number'],
        "vehicle_type"   => $user['vehicle_type']
    ]
]);
