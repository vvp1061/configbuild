<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

// Определяем, какой тип запроса пришел
$commandType = $input['command'] ?? null; // Для нового скрипта
$commandList = $input['commands'] ?? []; // Для старых чекбоксов

$output = [];
$message = '';

// --- Обработка нового запроса: запуск bash-скрипта ---
if ($commandType === 'run_script') {
    $choice = $input['choice'] ?? null;

    // Валидация и безопасность
    if (!is_numeric($choice) || $choice < 1 || $choice > 4) {
        http_response_code(400);
        echo json_encode(['message' => 'Ошибка: выбор должен быть числом от 1 до 4.']);
        exit;
    }

    $scriptPath = __DIR__ . '/../../my_script.sh';
    
    // escapeshellarg - критически важная функция для безопасности!
    // Она экранирует аргументы, чтобы предотвратить инъекцию команд.
    $command = 'bash ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($choice);
    
    // shell_exec выполняет команду и возвращает ее вывод
    $script_output = shell_exec($command . " 2>&1"); // 2>&1 перенаправляет ошибки в основной вывод
    
    $output[] = $script_output;
    $message = 'Скрипт выполнен!';

// --- Обработка старого запроса: выполнение простых команд ---
} elseif (!empty($commandList)) {
    if (in_array('date', $commandList)) {
        $output[] = "--- date ---\n" . date('Y-m-d H:i:s T');
    }
    if (in_array('pwd', $commandList)) {
        $output[] = "--- pwd ---\n" . getcwd();
    }
    if (in_array('ls', $commandList)) {
        $output[] = "--- ls ---\n" . implode("\n", scandir(__DIR__ . '/../'));
    }
    $message = 'Команды выполнены!';
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Некорректный запрос.']);
    exit;
}

// Отправляем успешный ответ
echo json_encode([
    'message' => $message,
    'output' => implode("\n\n", $output)
]);
?>