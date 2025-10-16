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
    ],

    // --- 2. Команды и скрипты для выполнения ---
    // Здесь мы можем менять команды, добавлять ключи и т.д.
    // Ключ (например, 'date') - это то, что приходит с front-end.
    // Значение - это команда, которая будет выполнена на сервере.
    'commands' => [
        // Простые команды
        'date' => 'date',
        'pwd'  => 'pwd',
        // Более сложная команда с ключами
        'ls'   => 'ls -lah ' . escapeshellarg(PROJECT_ROOT . '/public'),
    ],

    'scripts' => [
        // Скрипты, которые можно запускать с параметрами
        'my_script' => [
            'path' => PROJECT_ROOT . '/my_script.sh',
            'description' => 'Основной скрипт обработки с параметром (1-4).',
        ],
        // Скрипт для создания файлов перед архивацией
        'processing_script' => [
            'path' => PROJECT_ROOT . '/processing_script.sh',
            'description' => 'Скрипт, подготавливающий файлы для архивации.',
        ],
    ],
];

?>
