<?php
include "../config/db.php";
include "../config/auth.php";
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$user = getAuthUser($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$data           = json_decode(file_get_contents("php://input"), true);
$name           = trim($data['name']           ?? $user['name']);
$vehicle_number = trim($data['vehicle_number'] ?? $user['vehicle_number']);
$vehicle_type   = $data['vehicle_type']        ?? $user['vehicle_type'];

if (!$name || !$vehicle_number || !$vehicle_type) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET name = ?, vehicle_number = ?, vehicle_type = ? WHERE id = ?");
$stmt->bind_param("sssi", $name, $vehicle_number, $vehicle_type, $user['id']);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed"]);
}
