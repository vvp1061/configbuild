<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';

$uploadDir = $config['paths']['upload_dir'] ?? null;
if (!$uploadDir) {
    http_response_code(500);
    echo json_encode(['message' => 'Не задан каталог загрузки на сервере.']);
    exit;
}

if (!is_dir($uploadDir)) {
    if (!@mkdir($uploadDir, 0775, true)) {
        http_response_code(500);
        echo json_encode(['message' => 'Не удалось создать каталог загрузки на сервере.']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Метод не поддерживается.']);
    exit;
}

if (!isset($_FILES['filesToUpload'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Файлы не переданы.']);
    exit;
}

$files = $_FILES['filesToUpload'];
$uploadedCount = 0;
$errors = [];

for ($i = 0; $i < count($files['name']); $i++) {
    if ($files['error'][$i] !== UPLOAD_ERR_OK) {
        $errors[] = $files['name'][$i] . ': ошибка загрузки (' . $files['error'][$i] . ')';
        continue;
    }
    $safeName = basename($files['name'][$i]);
    $targetPath = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $safeName;
    if (!@move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
        $errors[] = $safeName . ': не удалось сохранить файл.';
        continue;
    }
    $uploadedCount++;
}

if ($uploadedCount === 0 && !empty($errors)) {
    http_response_code(400);
    echo json_encode(['message' => 'Загрузка не удалась: ' . implode('; ', $errors)]);
    exit;
}

echo json_encode([
    'message' => 'Файлы загружены: ' . $uploadedCount . (empty($errors) ? '' : '. Ошибки: ' . implode('; ', $errors)),
]);
?>