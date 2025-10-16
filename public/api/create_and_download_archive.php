<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
// --- ШАГ 1: Запускаем обрабатывающий скрипт ---
$scriptPath = __DIR__ . '/../../processing_script.sh';
// shell_exec выполняет скрипт и ждет его завершения
shell_exec('bash ' . escapeshellarg($scriptPath));

// --- ШАГ 2: Создаем ZIP-архив ---
// Папка, которую будем архивировать
$sourceDir = __DIR__ . '/../../processed_files/';
// Имя временного файла архива
$zipFileName = 'archive_' . date('Y-m-d_H-i-s') . '.zip';
$zipFilePath = sys_get_temp_dir() . '/' . $zipFileName; // Сохраняем во временную папку системы

$zip = new ZipArchive();
if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    http_response_code(500);
    die("Не удалось создать архив");
}

// Добавляем файлы в архив
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($sourceDir), RecursiveIteratorIterator::LEAVES_ONLY);
foreach ($files as $name => $file) {
    if (!$file->isDir()) {
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($sourceDir));
        $zip->addFile($filePath, $relativePath);
    }
}
$zip->close();


// --- ШАГ 3: Отдаем архив браузеру для скачивания ---
// Устанавливаем правильные заголовки
header('Content-Description: File Transfer');
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . basename($zipFilePath) . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($zipFilePath));

// Читаем файл и отправляем его в браузер
readfile($zipFilePath);


// --- ШАГ 4: Удаляем временный файл архива с сервера ---
unlink($zipFilePath);

exit;
?>