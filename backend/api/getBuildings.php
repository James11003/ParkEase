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

echo json_encode(["success" => true, "buildings" => $buildings]);
