<?php
define('PROJECT_ROOT', dirname(__DIR__));

return [
    'paths' => [
        'config_file' => PROJECT_ROOT . '/data/config_reg.json',
        'backup_dir' => PROJECT_ROOT . '/data/backups/',
        'upload_dir' => PROJECT_ROOT . '/uploads/',
        'log_dir' => PROJECT_ROOT . '/logs/',
        'processed_files_dir' => PROJECT_ROOT . '/processed_files/',
    ],

    // Все скрипты запускаются как долгие задачи через /api/start_task.php
    'scripts' => [
        'build' => [
            'path' => PROJECT_ROOT . '/build.sh',
            'description' => 'Долгая сборка с ключами kernel, fs, net.',
        ],
        'my_script' => [
            'path' => PROJECT_ROOT . '/my_script.sh',
            'description' => 'Скрипт с числовым параметром (1-4).',
        ],
        'processing_script' => [
            'path' => PROJECT_ROOT . '/processing_script.sh',
            'description' => 'Долгая задача подготовки архива.',
        ],
    ],
];
?>