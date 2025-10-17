<?php
$config = require __DIR__ . '/../../config/config.php';

// Берем путь к папке с результатами из конфига
$sourceDir = $config['paths']['processed_files_dir'];

if (!is_dir($sourceDir)) {
    http_response_code(500);
    die("Ошибка: директория с обработанными файлами не найдена.");
}

// --- Создаем ZIP-архив ---
$zipFileName = 'archive_' . date('Y-m-d_H-i-s') . '.zip';
$zipFilePath = sys_get_temp_dir() . '/' . $zipFileName;

$zip = new ZipArchive();
if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    http_response_code(500);
    die("Не удалось создать архив");
}

$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($sourceDir), RecursiveIteratorIterator::LEAVES_ONLY);
foreach ($files as $name => $file) {
    if (!$file->isDir()) {
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($sourceDir));
        $zip->addFile($filePath, $relativePath);
    }
}
$zip->close();

// --- Отдаем архив браузеру для скачивания ---
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . basename($zipFilePath) . '"');
header('Content-Length: ' . filesize($zipFilePath));
readfile($zipFilePath);

// --- Удаляем временный файл архива ---
unlink($zipFilePath);
exit;
?>