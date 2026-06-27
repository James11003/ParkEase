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

if (!$building_id) {
    echo json_encode(["success" => false, "message" => "Building ID is required"]);
    exit;
}

// Cascades to floors → parking_slots (FK ON DELETE CASCADE)
// But bookings reference slots — cancel active ones first
$conn->query("
    UPDATE bookings b
    JOIN parking_slots ps ON b.slot_id = ps.id
    JOIN floors f ON ps.floor_id = f.id
    SET b.booking_status = 'cancelled'
    WHERE f.building_id = $building_id AND b.booking_status = 'active'
");

$stmt = $conn->prepare("DELETE FROM buildings WHERE id = ?");
$stmt->bind_param("i", $building_id);
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Building deleted"]);
} else {
    echo json_encode(["success" => false, "message" => "Building not found or could not be deleted"]);
}
