#!/bin/bash

# $1 - Путь к папке с результатами
# $2 - ID задачи для создания файла-флага

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Критическая ошибка: Не указана директория для вывода или ID задачи."
  exit 1
fi

OUTPUT_DIR="$1"
TASK_ID="$2"
LOG_DIR=$(dirname "$OUTPUT_DIR")/logs # Определяем папку логов относительно папки processed_files
DONE_FILE="$LOG_DIR/${TASK_ID}.done"

# Создаем папку, если ее нет, и очищаем ее
mkdir -p "$OUTPUT_DIR"
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Критическая ошибка: не удалось создать директорию $OUTPUT_DIR"
    exit 1
fi
rm -f "$OUTPUT_DIR"/*

echo "Запуск обработки..."
echo "Файлы будут сохранены в: $OUTPUT_DIR"

# Создаем несколько файлов с результатами
echo "Результат обработки данных A от $(date)" > "$OUTPUT_DIR/result_A.txt"
echo "Лог выполнения для B от $(date)" > "$OUTPUT_DIR/log_B.log"
sleep 1
echo "Все готово." > "$OUTPUT_DIR/status.txt"

echo "Обработка завершена."

# Создаем специальный файл-флаг, который означает "готово"
touch "$DONE_FILE"

exit 0