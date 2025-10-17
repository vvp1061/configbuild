<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';
$input = json_decode(file_get_contents('php://input'), true);

$scriptKey = $input['script_key'] ?? null;
$userArgs = $input['args'] ?? []; // Аргументы от пользователя

if (!$scriptKey || !isset($config['scripts'][$scriptKey])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Не указан или не найден ключ скрипта.']);
    exit;
}

$scriptPath = $config['scripts'][$scriptKey]['path'];
$taskId = $scriptKey . '_' . time();

// --- ИЗМЕНЕНИЕ: Собираем команду по-новому ---
// 1. Команда запуска
$command = 'bash ' . escapeshellarg($scriptPath);

// 2. Добавляем аргументы от пользователя (если они есть)
if (is_array($userArgs)) {
    foreach ($userArgs as $arg) {
        $command .= ' ' . escapeshellarg($arg);
    }
}

// 3. ВСЕГДА добавляем ID задачи как ПОСЛЕДНИЙ аргумент
$command .= ' ' . escapeshellarg($taskId);
// --- КОНЕЦ ИЗМЕНЕНИЙ ---

$logDir = $config['paths']['log_dir'];
$logFile = $logDir . $taskId . '.log';

// Убираем создание .done файла отсюда, т.к. теперь это делает сам скрипт
$fullCommand = $command . ' > ' . escapeshellarg($logFile) . ' 2>&1 &';
shell_exec($fullCommand);

echo json_encode(['status' => 'started', 'task_id' => $taskId]);
?>