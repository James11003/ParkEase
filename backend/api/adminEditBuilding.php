<?php
include "../config/db.php";
include "../config/auth.php";
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$user = getAuthUser($conn);
if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access denied"]);
    exit;
}

$data        = json_decode(file_get_contents("php://input"), true);
$building_id = intval($data['building_id'] ?? 0);
$name        = trim($data['name'] ?? '');

if (!$building_id || !$name) {
    echo json_encode(["success" => false, "message" => "Building ID and name are required"]);
    exit;
}

$check = $conn->prepare("SELECT id FROM buildings WHERE name = ? AND id != ?");
$check->bind_param("si", $name, $building_id);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Another building with that name already exists"]);
    exit;
}

$stmt = $conn->prepare("UPDATE buildings SET name = ? WHERE id = ?");
$stmt->bind_param("si", $name, $building_id);
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Building name updated"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made"]);
}
