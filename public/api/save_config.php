<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';
$dataFile = $config['paths']['config_file'];
$backupDir = $config['paths']['backup_dir'];

if (!is_dir($backupDir)) {
    mkdir($backupDir, 0775, true);
}

$backupFile = $backupDir . 'config_reg_' . date('Y-m-d_H-i-s') . '.json.bak';
if (file_exists($dataFile)) {
    copy($dataFile, $backupFile);
}

$json_data = file_get_contents('php://input');
if (empty($json_data)) {
    http_response_code(400);
    echo json_encode(['message' => 'Нет данных для сохранения.']);
    exit;
}

$data = json_decode($json_data);
if ($data === null) {
    http_response_code(400);
    echo json_encode(['message' => 'Ошибка: получены некорректные JSON-данные.']);
    exit;
}

$pretty_json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
file_put_contents($dataFile, $pretty_json);

echo json_encode(['message' => 'Конфигурация успешно сохранена! Бэкап создан.']);
?>