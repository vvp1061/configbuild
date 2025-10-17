<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';

$taskId = $_GET['id'] ?? null;
if (!$taskId || !preg_match('/^build_\d+$/', $taskId)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'log_output' => 'Неверный ID задачи.']);
    exit;
}

$logDir = $config['paths']['log_dir'];
$logFile = $logDir . $taskId . '.log';
$doneFile = $logDir . $taskId . '.done';

$logOutput = '';
if (file_exists($logFile)) {
    $logOutput = file_get_contents($logFile);
}

if (file_exists($doneFile)) {
    echo json_encode(['status' => 'finished', 'log_output' => $logOutput]);
    @unlink($logFile);
    @unlink($doneFile);
} else {
    echo json_encode(['status' => 'running', 'log_output' => $logOutput]);
}
exit;
?>