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

$data       = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['booking_id'] ?? '';

if (!$booking_id) {
    echo json_encode(["success" => false, "message" => "Booking ID is required"]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ? AND booking_status = 'active'");
$stmt->bind_param("ii", $booking_id, $user['id']);
$stmt->execute();
$booking = $stmt->get_result()->fetch_assoc();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "Active booking not found"]);
    exit;
}

$cancel = $conn->prepare("UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?");
$cancel->bind_param("i", $booking_id);
$cancel->execute();

echo json_encode(["success" => true, "message" => "Booking cancelled successfully"]);
