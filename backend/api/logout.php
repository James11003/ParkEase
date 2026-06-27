<?php
include "../config/db.php";
include "../config/auth.php";
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$user = getAuthUser($conn);

if ($user) {
    $stmt = $conn->prepare("UPDATE users SET auth_token = NULL WHERE id = ?");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
}

echo json_encode(["success" => true, "message" => "Logged out"]);
