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

// Auto-complete bookings whose end time has passed
$conn->query("
    UPDATE bookings SET booking_status = 'completed'
    WHERE booking_status = 'active'
      AND CONCAT(booking_date, ' ', end_time) < NOW()
");

$search = trim($_GET['search'] ?? '');

if ($search) {
    $like = "%$search%";
    $stmt = $conn->prepare("
        SELECT b.*, u.name AS user_name, u.email, u.vehicle_number, u.vehicle_type,
               ps.slot_number, f.floor_name, f.floor_number, bg.name AS building_name
        FROM bookings b
        JOIN users u         ON b.user_id  = u.id
        JOIN parking_slots ps ON b.slot_id  = ps.id
        JOIN floors f         ON ps.floor_id = f.id
        JOIN buildings bg     ON f.building_id = bg.id
        WHERE u.name LIKE ? OR u.email LIKE ? OR ps.slot_number LIKE ? OR b.booking_status LIKE ?
           OR bg.name LIKE ? OR f.floor_name LIKE ?
        ORDER BY b.created_at DESC
    ");
    $stmt->bind_param("ssssss", $like, $like, $like, $like, $like, $like);
} else {
    $stmt = $conn->prepare("
        SELECT b.*, u.name AS user_name, u.email, u.vehicle_number, u.vehicle_type,
               ps.slot_number, f.floor_name, f.floor_number, bg.name AS building_name
        FROM bookings b
        JOIN users u          ON b.user_id   = u.id
        JOIN parking_slots ps ON b.slot_id   = ps.id
        JOIN floors f         ON ps.floor_id  = f.id
        JOIN buildings bg     ON f.building_id = bg.id
        ORDER BY b.created_at DESC
    ");
}

$stmt->execute();
$result   = $stmt->get_result();
$bookings = [];
while ($row = $result->fetch_assoc()) $bookings[] = $row;

echo json_encode(["success" => true, "bookings" => $bookings]);
