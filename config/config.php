<?php

// --- Центральный файл конфигурации ---

// Определяем корневую директорию проекта.
// Это делает все остальные пути надежными.
define('PROJECT_ROOT', dirname(__DIR__));

return [
    // --- 1. Пути к файлам и директориям ---
    'paths' => [
        'config_file' => PROJECT_ROOT . '/data/config_reg.json',
        'backup_dir' => PROJECT_ROOT . '/data/backups/',
        'upload_dir' => PROJECT_ROOT . '/uploads/',
        'processed_files_dir' => PROJECT_ROOT . '/processed_files/', // Папка с файлами для архива
        'log_dir' => PROJECT_ROOT . '/logs/',                   // Папка для логов фоновых задач
    ],

    // --- 2. Команды и скрипты для выполнения ---
    // Здесь мы можем менять команды, добавлять ключи и т.д.
    'commands' => [
        'date' => 'date',
        'pwd'  => 'pwd',
        'ls'   => 'ls -lah ' . escapeshellarg(PROJECT_ROOT . '/public'),
    ],

    'scripts' => [
        'my_script' => [
            'path' => PROJECT_ROOT . '/my_script.sh',
            'description' => 'Основной скрипт обработки с параметром (1-4).',
        ],
        'processing_script' => [
            'path' => PROJECT_ROOT . '/processing_script.sh',
            'description' => 'Скрипт, подготавливающий файлы для архивации.',
        ],
    ],
];

?>