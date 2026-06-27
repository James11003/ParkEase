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

$data       = json_decode(file_get_contents("php://input"), true);
$floor_id   = intval($data['floor_id']  ?? 0);
$floor_name = trim($data['floor_name'] ?? '');

if (!$floor_id || !$floor_name) {
    echo json_encode(["success" => false, "message" => "Floor ID and name are required"]);
    exit;
}

$stmt = $conn->prepare("UPDATE floors SET floor_name = ? WHERE id = ?");
$stmt->bind_param("si", $floor_name, $floor_id);
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Floor name updated"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made"]);
}
