<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';
$configFile = $config['paths']['config_file'];

if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['message' => 'Файл конфигурации не найден.']);
    exit;
}
echo file_get_contents($configFile);
?>