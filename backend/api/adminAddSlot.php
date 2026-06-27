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
$floor_id    = intval($data['floor_id']    ?? 0);
$slot_number = trim($data['slot_number']   ?? '');

if (!$floor_id || !$slot_number) {
    echo json_encode(["success" => false, "message" => "Floor and slot number are required"]);
    exit;
}

// Verify floor exists
$fCheck = $conn->prepare("SELECT id FROM floors WHERE id = ?");
$fCheck->bind_param("i", $floor_id);
$fCheck->execute();
$fCheck->store_result();
if ($fCheck->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Floor not found"]);
    exit;
}

// Check duplicate slot number
$check = $conn->prepare("SELECT id FROM parking_slots WHERE slot_number = ?");
$check->bind_param("s", $slot_number);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Slot number already exists"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO parking_slots (floor_id, slot_number) VALUES (?, ?)");
$stmt->bind_param("is", $floor_id, $slot_number);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Slot added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add slot"]);
}
