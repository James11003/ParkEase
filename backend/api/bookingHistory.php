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

// Auto-complete bookings whose end time has passed
$conn->query("
    UPDATE bookings SET booking_status = 'completed'
    WHERE booking_status = 'active'
      AND CONCAT(booking_date, ' ', end_time) < NOW()
");

$stmt = $conn->prepare("
    SELECT b.*, ps.slot_number, f.floor_name, f.floor_number, bg.name AS building_name
    FROM bookings b
    JOIN parking_slots ps ON b.slot_id    = ps.id
    JOIN floors f         ON ps.floor_id   = f.id
    JOIN buildings bg     ON f.building_id = bg.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result   = $stmt->get_result();
$bookings = [];
while ($row = $result->fetch_assoc()) $bookings[] = $row;

echo json_encode(["success" => true, "bookings" => $bookings]);
