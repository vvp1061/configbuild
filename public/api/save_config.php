<?php
header('Content-Type: application/json');
$configFile = __DIR__ . '/../../data/config_reg.json';

// Получаем JSON из тела POST-запроса
$json_data = file_get_contents('php://input');

if (empty($json_data)) {
    http_response_code(400);
    echo json_encode(['message' => 'Нет данных для сохранения.']);
    exit;
}

// Записываем данные в файл
file_put_contents($configFile, $json_data);

echo json_encode(['message' => 'Конфигурация успешно сохранена!']);
?>