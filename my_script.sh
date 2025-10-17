#!/bin/bash

# Долгий скрипт с числовым параметром (1-4).
# Формат вызова (от PHP):
#   bash my_script.sh <CHOICE_1_4> <TASK_ID>
# где <TASK_ID> — последний аргумент, создаём logs/<TASK_ID>.done по завершении.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "КРИТИЧЕСКАЯ ОШИБКА: Укажите параметры: <число 1-4> <TASK_ID>"
  exit 1
fi

CHOICE="$1"
TASK_ID="$2"

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
LOG_DIR="$PROJECT_ROOT/logs"
DONE_FILE="$LOG_DIR/${TASK_ID}.done"

mkdir -p "$LOG_DIR"

echo "=== Старт долгой задачи my_script (TASK_ID=${TASK_ID}) ==="
echo "Выбранная опция: ${CHOICE}"
echo "Это длительная операция. Пожалуйста, подождите..."

case "$CHOICE" in
  1)
    echo "Опция 1: Сбор информации о системе..."; sleep 2
    uname -a; sleep 2
    echo "Доп. анализ конфигурации..."; sleep 3
    ;;
  2)
    echo "Опция 2: Анализ использования дисков..."; sleep 2
    df -h; sleep 2
    echo "Сканирование точек монтирования..."; sleep 3
    ;;
  3)
    echo "Опция 3: Анализ памяти..."; sleep 2
    free -h; sleep 2
    echo "Сбор статистики по процессам..."; sleep 3
    ;;
  4)
    echo "Опция 4: Получение последних записей журнала..."; sleep 2
    # journalctl может быть недоступен в окружении — подстрахуемся
    if command -v journalctl >/dev/null 2>&1; then
      journalctl -n 5 --no-pager || true
    else
      echo "journalctl недоступен, выводим dmesg (хвост)"; dmesg | tail -n 20 || true
    fi
    sleep 3
    ;;
  *)
    echo "Ошибка: Неверная опция. Пожалуйста, выберите число от 1 до 4."
    exit 1
    ;;
esac

echo "=== Задача my_script завершена (TASK_ID=${TASK_ID}) ==="
# Сигнализируем PHP-эндпоинту о завершении
: > "$DONE_FILE"

exit 0
