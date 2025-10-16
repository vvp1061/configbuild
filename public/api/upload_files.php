<?php
header('Content-Type: application/json');
$uploadDir = __DIR__ . '/../../uploads/';
$uploadedFiles = [];
$errors = [];

// PHP прекрасно обрабатывает несколько файлов
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

if (!empty($errors)) {
    http_response_code(500);
    echo json_encode(['message' => implode(' ', $errors)]);
} else {
    echo json_encode(['message' => 'Успешно загружено ' . count($uploadedFiles) . ' файлов.']);
}
?>