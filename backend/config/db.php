<?php
// Database connection
$conn = new mysqli("localhost", "root", "root", "parkease");

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Database connection failed"]));
}
