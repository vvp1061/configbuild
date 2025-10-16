<?php
header('Content-Type: application/json');
$config = require __DIR__ . '/../../config/config.php';
$uploadDir = $config['paths']['upload_dir'];

// ... (остальной код остается без изменений, т.к. он уже использует $uploadDir)
$uploadedFiles = [];
$errors = [];
foreach ($_FILES['filesToUpload']['name'] as $key => $name) {
    if ($_FILES['filesToUpload']['error'][$key] === UPLOAD_ERR_OK) {
        $tmp_name = $_FILES['filesToUpload']['tmp_name'][$key];
        $fileName = basename($name);
        move_uploaded_file($tmp_name, $uploadDir . $fileName);
        $uploadedFiles[] = $fileName;
    } else {
        $errors[] = "Ошибка при загрузке файла $name.";
    }
}
if (!empty($errors)) { /* ... обработка ошибок ... */ }
echo json_encode(['message' => 'Успешно загружено ' . count($uploadedFiles) . ' файлов.']);
?>