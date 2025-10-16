<?php
$config = require __DIR__ . '/../../config/config.php';

// --- ИЗМЕНЕНИЕ: Получаем оба пути из конфига ---
$scriptPath = $config['scripts']['processing_script']['path'];
$sourceDir = $config['paths']['processed_files_dir']; // Папка с результатами

// --- Запускаем обрабатывающий скрипт, ПЕРЕДАВАЯ ЕМУ ПУТЬ как аргумент ---
// escapeshellarg защитит и путь, и команду
$command = 'bash ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($sourceDir);
shell_exec($command);

// Проверяем, что папка действительно была создана скриптом
if (!is_dir($sourceDir)) {
    http_response_code(500);
    // Добавим более информативное сообщение об ошибке
    error_log("Критическая ошибка: обрабатывающий скрипт не создал директорию: " . $sourceDir);
    die("Критическая ошибка: обрабатывающий скрипт не создал директорию с результатами.");
}

// --- Остальной код для создания и отдачи архива остается без изменений ---
$zipFileName = 'archive_' . date('Y-m-d_H-i-s') . '.zip';
$zipFilePath = sys_get_temp_dir() . '/' . $zipFileName;
$zip = new ZipArchive();
if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) { /* ... */ }
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($sourceDir), RecursiveIteratorIterator::LEAVES_ONLY);
foreach ($files as $name => $file) {
    if (!$file->isDir()) {
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($sourceDir));
        $zip->addFile($filePath, $relativePath);
    }
}
$zip->close();
header('Content-Description: File Transfer');
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . basename($zipFilePath) . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($zipFilePath));
readfile($zipFilePath);
unlink($zipFilePath);
exit;
?>