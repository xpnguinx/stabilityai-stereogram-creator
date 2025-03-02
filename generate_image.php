<?php
// generate_image.php - Backend for the AI Stereogram creator
header('Content-Type: application/json');

// Allow cross-origin requests if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['prompt']) || empty($data['prompt'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Prompt is required']);
    exit;
}

// Get API key from request or use default
$apiKey = isset($data['apiKey']) && !empty($data['apiKey']) 
    ? $data['apiKey'] 
    : 'ENTER-API-KEY-HERE';

// Set image type
$outputFormat = isset($data['outputFormat']) ? $data['outputFormat'] : 'jpeg';

// Call Stability AI API to generate the image
$url = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

// Create multipart form data
$postFields = [
    'prompt' => $data['prompt'],
    'output_format' => $outputFormat
];

// Configure and execute cURL request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$apiKey}",
    "Accept: image/*"
    // Note: Content-Type will be set automatically for multipart/form-data
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields); // No json_encode for multipart/form-data
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$curlError = curl_error($ch);
curl_close($ch);

// Check for errors
if ($response === false || $statusCode !== 200) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to generate image',
        'statusCode' => $statusCode,
        'curlError' => $curlError
    ]);
    exit;
}

// Determine if we need to save the image
$saveImage = isset($data['saveImage']) && $data['saveImage'];
$imagePath = null;

if ($saveImage) {
    // Create uploads directory if it doesn't exist
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate a unique filename
    $imageType = $outputFormat === 'jpeg' ? 'jpg' : $outputFormat;
    $filename = uniqid('img_') . '.' . $imageType;
    $filePath = $uploadDir . $filename;
    
    // Save the image
    if (file_put_contents($filePath, $response)) {
        $imagePath = $filePath;
    }
}

// Return a data URI if not saving the file
if (!$saveImage) {
    $mimeType = $outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    $base64Image = base64_encode($response);
    echo json_encode([
        'success' => true,
        'imageData' => "data:{$mimeType};base64,{$base64Image}"
    ]);
} else {
    // Return the path to the saved image
    echo json_encode([
        'success' => true,
        'imagePath' => $imagePath
    ]);
}
?>