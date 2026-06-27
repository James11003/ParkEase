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

$data    = json_decode(file_get_contents("php://input"), true);
$action  = $data['action']  ?? '';
$slot_id = $data['slot_id'] ?? '';

if (!$action || !$slot_id) {
    echo json_encode(["success" => false, "message" => "Action and slot ID are required"]);
    exit;
}

if ($action === 'delete') {
    $stmt = $conn->prepare("DELETE FROM parking_slots WHERE id = ?");
    $stmt->bind_param("i", $slot_id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Slot removed"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to remove slot"]);
    }

} elseif ($action === 'set_status') {
    $status  = $data['status'] ?? '';
    $allowed = ['available', 'occupied', 'unavailable'];
    if (!in_array($status, $allowed)) {
        echo json_encode(["success" => false, "message" => "Invalid status"]);
        exit;
    }

    // If freeing up a slot, cancel any active booking on it first
    if ($status === 'available') {
        $cancel = $conn->prepare(
            "UPDATE bookings SET booking_status = 'cancelled'
             WHERE slot_id = ? AND booking_status = 'active'"
        );
        $cancel->bind_param("i", $slot_id);
        $cancel->execute();
    }

    $stmt = $conn->prepare("UPDATE parking_slots SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $slot_id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Slot status updated"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update status"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid action"]);
}
