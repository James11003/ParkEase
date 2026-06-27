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

// Flat slot list with building & floor info
$result = $conn->query("
    SELECT ps.id, ps.slot_number, ps.status,
           f.id AS floor_id, f.floor_number, f.floor_name,
           b.id AS building_id, b.name AS building_name
    FROM parking_slots ps
    JOIN floors f ON ps.floor_id = f.id
    JOIN buildings b ON f.building_id = b.id
    ORDER BY b.name, f.floor_number, ps.slot_number
");
$slots = [];
while ($row = $result->fetch_assoc()) $slots[] = $row;

// If a date is provided, find which slots are already booked on that date
$bookedSlotIds = [];
$date = trim($_GET['date'] ?? '');
if ($date) {
    $bStmt = $conn->prepare("
        SELECT DISTINCT slot_id FROM bookings
        WHERE booking_date = ? AND booking_status = 'active'
    ");
    $bStmt->bind_param("s", $date);
    $bStmt->execute();
    $bResult = $bStmt->get_result();
    while ($row = $bResult->fetch_assoc()) $bookedSlotIds[] = (int)$row['slot_id'];
}

// Buildings → floors hierarchy (for filter dropdowns)
$bResult   = $conn->query("SELECT * FROM buildings ORDER BY name");
$buildings = [];
while ($b = $bResult->fetch_assoc()) {
    $fStmt = $conn->prepare("SELECT * FROM floors WHERE building_id = ? ORDER BY floor_number");
    $fStmt->bind_param("i", $b['id']);
    $fStmt->execute();
    $fr = $fStmt->get_result();
    $floors = [];
    while ($f = $fr->fetch_assoc()) $floors[] = $f;
    $b['floors'] = $floors;
    $buildings[] = $b;
}

// Stats (physical)
$available = $occupied = $unavailable = 0;
foreach ($slots as $s) {
    if ($s['status'] === 'available')        $available++;
    elseif ($s['status'] === 'occupied')     $occupied++;
    else                                      $unavailable++;
}

echo json_encode([
    "success"         => true,
    "slots"           => $slots,
    "buildings"       => $buildings,
    "booked_slot_ids" => $bookedSlotIds,
    "stats"           => [
        "available"   => $available,
        "occupied"    => $occupied,
        "unavailable" => $unavailable,
        "total"       => count($slots)
    ]
]);
