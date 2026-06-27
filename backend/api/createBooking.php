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

$data         = json_decode(file_get_contents("php://input"), true);
$slot_id      = $data['slot_id']      ?? '';
$booking_date = $data['booking_date'] ?? '';
$start_time   = $data['start_time']   ?? '';
$end_time     = $data['end_time']     ?? '';

if (!$slot_id || !$booking_date || !$start_time || !$end_time) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

if ($start_time >= $end_time) {
    echo json_encode(["success" => false, "message" => "End time must be after start time"]);
    exit;
}

// Check slot exists and is not admin-blocked
$slotCheck = $conn->prepare("SELECT * FROM parking_slots WHERE id = ? AND status != 'unavailable'");
$slotCheck->bind_param("i", $slot_id);
$slotCheck->execute();
if ($slotCheck->get_result()->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Slot is not available"]);
    exit;
}

// Check slot not already booked on this date
$dateCheck = $conn->prepare("SELECT id FROM bookings WHERE slot_id = ? AND booking_date = ? AND booking_status = 'active'");
$dateCheck->bind_param("is", $slot_id, $booking_date);
$dateCheck->execute();
$dateCheck->store_result();
if ($dateCheck->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "This slot is already booked on the selected date"]);
    exit;
}

// One active booking per user at a time
$activeCheck = $conn->prepare("SELECT id FROM bookings WHERE user_id = ? AND booking_status = 'active'");
$activeCheck->bind_param("i", $user['id']);
$activeCheck->execute();
$activeCheck->store_result();
if ($activeCheck->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "You already have an active booking. Cancel it first."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO bookings (user_id, slot_id, booking_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iisss", $user['id'], $slot_id, $booking_date, $start_time, $end_time);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Slot booked successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Booking failed. Please try again."]);
}
