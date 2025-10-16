<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$requestedCommands = $input['commands'] ?? [];
$output = [];

// Белый список безопасных команд
if (in_array('date', $requestedCommands)) {
    $output[] = "--- date ---\n" . date('Y-m-d H:i:s T');
}
if (in_array('pwd', $requestedCommands)) {
    $output[] = "--- pwd ---\n" . getcwd(); // getcwd() безопасна
}
if (in_array('ls', $requestedCommands)) {
    // scandir() безопасна, она просто читает имена файлов
    $output[] = "--- ls ---\n" . implode("\n", scandir(__DIR__ . '/../'));
}

echo json_encode([
    'message' => 'Команды выполнены!',
    'output' => implode("\n\n", $output)
]);
?>