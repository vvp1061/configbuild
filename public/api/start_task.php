<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';

$taskId = 'build_' . time();
$scriptPath = $config['scripts']['processing_script']['path'];
$processedFilesDir = $config['paths']['processed_files_dir'];
$logDir = $config['paths']['log_dir'];

$logFile = $logDir . $taskId . '.log';
$doneFile = $logDir . $taskId . '.done';

@unlink($logFile);
@unlink($doneFile);

// Передаем в скрипт путь к папке с результатами и ID задачи
$command = 'bash ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($processedFilesDir) . ' ' . escapeshellarg($taskId) . ' > ' . escapeshellarg($logFile) . ' 2>&1 &';
shell_exec($command);

echo json_encode(['status' => 'started', 'task_id' => $taskId]);
?>