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

$data         = json_decode(file_get_contents("php://input"), true);
$building_id  = intval($data['building_id']  ?? 0);
$floor_number = intval($data['floor_number'] ?? 0);
$floor_name   = trim($data['floor_name']     ?? '');

if (!$building_id || !$floor_number || !$floor_name) {
    echo json_encode(["success" => false, "message" => "Building, floor number and floor name are required"]);
    exit;
}

// Check building exists
$bCheck = $conn->prepare("SELECT id FROM buildings WHERE id = ?");
$bCheck->bind_param("i", $building_id);
$bCheck->execute();
$bCheck->store_result();
if ($bCheck->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Building not found"]);
    exit;
}

// Check duplicate floor number in this building
$fCheck = $conn->prepare("SELECT id FROM floors WHERE building_id = ? AND floor_number = ?");
$fCheck->bind_param("ii", $building_id, $floor_number);
$fCheck->execute();
$fCheck->store_result();
if ($fCheck->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Floor number already exists in this building"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO floors (building_id, floor_number, floor_name) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $building_id, $floor_number, $floor_name);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Floor added successfully", "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add floor"]);
}
