<?php
header('Content-Type: application/json');
$dataFile = __DIR__ . '/../../data/config_reg.json';
$backupDir = __DIR__ . '/../../data/backups/'; // Папка для бэкапов

// --- НОВЫЙ БЛОК: Создание бэкапа ---
// Убедимся, что папка для бэкапов существует
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0775, true);
}

// Генерируем имя файла для бэкапа с датой и временем
$backupFile = $backupDir . 'config_reg_' . date('Y-m-d_H-i-s') . '.json.bak';

// Копируем текущий файл в бэкап, если он существует
if (file_exists($dataFile)) {
    copy($dataFile, $backupFile);
}
// --- КОНЕЦ НОВОГО БЛОКА ---


// 1. Получаем сжатую JSON-строку из тела POST-запроса
$json_data = file_get_contents('php://input');

if (empty($json_data)) {
    http_response_code(400);
    echo json_encode(['message' => 'Нет данных для сохранения.']);
    exit;
}

// 2. Декодируем строку в PHP-объект/массив
$data = json_decode($json_data);

// Проверяем, что декодирование прошло успешно
if ($data === null) {
    http_response_code(400);
    echo json_encode(['message' => 'Ошибка: получены некорректные JSON-данные.']);
    exit;
}

// 3. Кодируем данные обратно в строку с форматированием
$pretty_json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// 4. Сохраняем в файл уже красивую, отформатированную строку
file_put_contents($dataFile, $pretty_json);

echo json_encode(['message' => 'Конфигурация успешно сохранена! Бэкап создан.']);
?>