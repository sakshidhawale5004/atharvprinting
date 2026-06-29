<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dataFile = 'data/enquiries.json';
$data = [];

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $data = json_decode($json, true) ?: [];
}

echo json_encode($data);
?>
