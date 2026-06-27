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

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name'] ?? '');

if (!$name) {
    echo json_encode(["success" => false, "message" => "Building name is required"]);
    exit;
}

$check = $conn->prepare("SELECT id FROM buildings WHERE name = ?");
$check->bind_param("s", $name);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Building already exists"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO buildings (name) VALUES (?)");
$stmt->bind_param("s", $name);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Building added successfully", "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add building"]);
}
