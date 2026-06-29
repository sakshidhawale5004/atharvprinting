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

if (isset($input['id'])) {
    $idToDelete = $input['id'];
    
    if (file_exists($dataFile)) {
        $json = file_get_contents($dataFile);
        $currentData = json_decode($json, true) ?: [];
        
        // Filter out the deleted item
        $filteredData = array_filter($currentData, function($item) use ($idToDelete) {
            return $item['id'] != $idToDelete;
        });
        
        // Re-index array
        $filteredData = array_values($filteredData);
        
        if (file_put_contents($dataFile, json_encode($filteredData, JSON_PRETTY_PRINT))) {
            echo json_encode(["status" => "success", "message" => "Enquiry deleted"]);
            exit;
        }
    }
}

http_response_code(500);
echo json_encode(["status" => "error", "message" => "Failed to delete"]);
?>
