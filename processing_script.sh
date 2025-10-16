#!/bin/bash

# Папка для результатов
OUTPUT_DIR="processed_files"

# Создаем папку, если ее нет, и очищаем ее
mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_DIR"/*

echo "Запуск обработки..."

# Создаем несколько файлов с результатами
echo "Результат обработки данных A от $(date)" > "$OUTPUT_DIR/result_A.txt"
echo "Лог выполнения для B от $(date)" > "$OUTPUT_DIR/log_B.log"
sleep 1 # Имитируем долгую работу
echo "Все готово." > "$OUTPUT_DIR/status.txt"

echo "Обработка завершена. Файлы созданы в папке '$OUTPUT_DIR'."

exit 0