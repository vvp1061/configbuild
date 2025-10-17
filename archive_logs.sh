#!/bin/bash

# $1 - Месяц для архивации
# $2 - ID задачи

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Ошибка: Не указан месяц для архивации или ID задачи."
  exit 1
fi

TARGET_MONTH=$1
TASK_ID=$2
PROJECT_ROOT=$(dirname "$0")
LOG_DIR="$PROJECT_ROOT/logs"
DONE_FILE="$LOG_DIR/${TASK_ID}.done"

echo "--- Запуск архивации логов за $TARGET_MONTH (ID: $TASK_ID) ---"
sleep 2
echo "Найдено файлов: 5"
sleep 2
echo "Создание архива..."
sleep 5
echo "--- Архивация завершена ---"

# Создаем файл-флаг
touch "$DONE_FILE"

exit 0