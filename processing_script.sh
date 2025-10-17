#!/bin/bash

# --- ИЗМЕНЕНИЕ: Теперь ожидаем только один аргумент ---
if [ -z "$1" ]; then
  echo "Критическая ошибка: Не указан ID задачи."
  exit 1
fi

TASK_ID="$1"
PROJECT_ROOT=$(dirname "$0")
OUTPUT_DIR="$PROJECT_ROOT/processed_files"
LOG_DIR="$PROJECT_ROOT/logs"
DONE_FILE="$LOG_DIR/${TASK_ID}.done"

# Создаем папку, если ее нет, и очищаем ее
mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_DIR"/*

echo "Запуск обработки (ID: $TASK_ID)..."

# Создаем файлы
echo "Результат обработки данных A от $(date)" > "$OUTPUT_DIR/result_A.txt"
sleep 1
echo "Все готово." > "$OUTPUT_DIR/status.txt"

echo "Обработка завершена."

# Создаем файл-флаг
touch "$DONE_FILE"

exit 0