<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';

$taskId = $_GET['id'] ?? null;
if (!$taskId || !preg_match('/^[a-z_]+_\d+$/', $taskId)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'log_output' => 'Неверный ID задачи.']);
    exit;
}

$logDir = $config['paths']['log_dir'];
$logFile = $logDir . $taskId . '.log';
$doneFile = $logDir . $taskId . '.done'; // Имя .done файла теперь вычисляется так же

$logOutput = '';
if (file_exists($logFile)) {
    $logOutput = file_get_contents($logFile);
}

if (file_exists($doneFile)) {
    // Задача завершена, отправляем финальный результат и очищаем
    echo json_encode(['status' => 'finished', 'log_output' => $logOutput]);
    @unlink($logFile);
    @unlink($doneFile);
} else {
    // Задача еще выполняется
    echo json_encode(['status' => 'running', 'log_output' => $logOutput]);
}
exit;
?>