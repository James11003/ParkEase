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

// Count bookings
$stmt = $conn->prepare("SELECT booking_status, COUNT(*) as count FROM bookings WHERE user_id = ? GROUP BY booking_status");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();
$counts = ['active' => 0, 'completed' => 0, 'cancelled' => 0];
while ($row = $result->fetch_assoc()) {
    $counts[$row['booking_status']] = (int)$row['count'];
}

echo json_encode([
    "success" => true,
    "user"    => [
        "id"             => $user['id'],
        "name"           => $user['name'],
        "email"          => $user['email'],
        "role"           => $user['role'],
        "vehicle_number" => $user['vehicle_number'],
        "vehicle_type"   => $user['vehicle_type'],
        "created_at"     => $user['created_at']
    ],
    "booking_counts" => $counts
]);
