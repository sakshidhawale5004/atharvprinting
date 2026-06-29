<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$dataFile = 'data/enquiries.json';

if (file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT))) {
    echo json_encode(["status" => "success", "message" => "All data cleared"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to clear data"]);
}
?>
