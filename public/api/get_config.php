<?php
header('Content-Type: application/json');
$configFile = __DIR__ . '/../../data/config_reg.json';

// Проверяем, существует ли файл
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['message' => 'Файл конфигурации не найден на сервере.']);
    exit;
}

// Читаем и отдаем содержимое
echo file_get_contents($configFile);
?>