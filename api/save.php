<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$dataFile = 'data/enquiries.json';

// Get POST data
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if ($input) {
    // Read existing data
    $currentData = [];
    if (file_exists($dataFile)) {
        $json = file_get_contents($dataFile);
        $currentData = json_decode($json, true) ?: [];
    }
    
    // Add new entry
    $currentData[] = $input;
    
    // Save back to file
    if (file_put_contents($dataFile, json_encode($currentData, JSON_PRETTY_PRINT))) {
        echo json_encode(["status" => "success", "message" => "Enquiry saved"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to write data file"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
}
?>
