<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';
$input = json_decode(file_get_contents('php://input'), true);

$output = [];
$message = '';

// --- Обработка запроса на запуск скрипта ---
if (($input['command'] ?? null) === 'run_script') {
    $choice = $input['choice'] ?? null;
    $scriptInfo = $config['scripts']['my_script']; // Берем инфо о скрипте из конфига

    if (!is_numeric($choice) || $choice < 1 || $choice > 4) { /* ... обработка ошибки ... */ }

    $command = 'bash ' . escapeshellarg($scriptInfo['path']) . ' ' . escapeshellarg($choice);
    $output[] = shell_exec($command . " 2>&1");
    $message = 'Скрипт выполнен!';

// --- Обработка запроса на выполнение простых команд ---
} elseif (!empty($input['commands'])) {
    $allowedCommands = $config['commands']; // Берем команды из конфига
    foreach ($input['commands'] as $cmdKey) {
        if (isset($allowedCommands[$cmdKey])) {
            $output[] = "--- {$cmdKey} ---\n" . shell_exec($allowedCommands[$cmdKey] . " 2>&1");
        }
    }
    $message = 'Команды выполнены!';
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Некорректный запрос.']);
    exit;
}

echo json_encode(['message' => $message, 'output' => implode("\n\n", $output)]);
?>