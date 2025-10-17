#!/bin/bash

# Скрипт долгой сборки.
# Формат вызова (от PHP):
#   bash build.sh <part1> <part2> ... <partN> <TASK_ID>
# где <TASK_ID> — всегда последний аргумент, остальные — выбранные части: kernel, fs, net

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "КРИТИЧЕСКАЯ ОШИБКА: Должно быть минимум 2 аргумента: <части...> <TASK_ID>"
  exit 1
fi

# Последний аргумент — это ID задачи
TASK_ID="${!#}"
# Все аргументы, кроме последнего — это список частей
PARTS=("${@:1:$(($#-1))}")

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
LOG_DIR="$PROJECT_ROOT/logs"
DONE_FILE="$LOG_DIR/${TASK_ID}.done"

mkdir -p "$LOG_DIR"

echo "=== СТАРТ ДОЛГОЙ СБОРКИ (TASK_ID=$TASK_ID) ==="
echo "Выбраны модули: ${PARTS[*]}"

# Печатаем человеко-читаемый план выполнения: ./build <part1> && ./build <part2> ...
PLAN=""
for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  if [ "$i" -gt 0 ]; then PLAN+=" && "; fi
  PLAN+="./build ${PART}"
done
[ -n "$PLAN" ] && echo "План выполнения: ${PLAN}"

do_build_part() {
  local MODULE="$1"
  case "$MODULE" in
    kernel)
      echo "--- НАЧАЛО СБОРКИ МОДУЛЯ: kernel ---"
      echo "Проверка зависимостей ядра..."; sleep 2
      echo "Компиляция ядра... (это может занять много времени)"; sleep 5
      echo "Сборка модуля kernel завершена."
      ;;
    fs)
      echo "--- НАЧАЛО СБОРКИ МОДУЛЯ: fs (файловая система) ---"
      echo "Анализ структуры дисков..."; sleep 2
      echo "Сборка драйверов..."; sleep 4
      echo "Сборка модуля fs завершена."
      ;;
    net)
      echo "--- НАЧАЛО СБОРКИ МОДУЛЯ: net (сеть) ---"
      echo "Конфигурация сетевых интерфейсов..."; sleep 2
      echo "Сборка сетевого стека..."; sleep 4
      echo "Сборка модуля net завершена."
      ;;
    *)
      echo "ОШИБКА: Неизвестный модуль '$MODULE'. Пропускаю." >&2
      ;;
  esac
}

for PART in "${PARTS[@]}"; do
  do_build_part "$PART"
  echo
done

echo "=== СБОРКА ЗАВЕРШЕНА (TASK_ID=$TASK_ID) ==="
# ВАЖНО: создаём .done-файл для сигнала PHP-эндпоинту о завершении
: > "$DONE_FILE"

exit 0