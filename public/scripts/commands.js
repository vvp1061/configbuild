document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // Секция долгой задачи (переписана с нуля)
    // ===================================================================
    const startTaskBtn = document.getElementById('start-task-btn');
    const downloadArchiveBtn = document.getElementById('download-archive-btn');
    const taskResultBox = document.getElementById('task-result');
    const taskStatusSpan = document.getElementById('task-status');
    const taskOutputPre = document.getElementById('task-output');

    // Глобальная переменная для ID интервала. Это критически важно.
    let taskCheckIntervalId = null;

    // Функция остановки опроса. Мы будем вызывать ее отовсюду.
    function stopPolling() {
        if (taskCheckIntervalId) {
            clearInterval(taskCheckIntervalId);
            taskCheckIntervalId = null;
            console.log('Polling stopped.');
        }
        startTaskBtn.disabled = false;
    }

    // Функция проверки статуса
    async function checkTaskStatus(taskId) {
        try {
            const response = await fetch(`/api/check_task_status.php?id=${taskId}`);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const result = await response.json();

            taskOutputPre.textContent = result.log_output || 'Ожидание вывода...';

            const status = (result.status || '').trim();
            taskStatusSpan.textContent = `(${status})`;

            // Явная и простая проверка на завершение
            if (status === 'finished') {
                taskStatusSpan.textContent = `(SUCCESS)`;
                downloadArchiveBtn.style.display = 'inline-flex';
                stopPolling();
            } else if (status === 'error') {
                taskStatusSpan.textContent = `(ERROR)`;
                downloadArchiveBtn.style.display = 'none';
                stopPolling();
            }
        } catch (error) {
            taskOutputPre.textContent += `\n\n[FATAL] Ошибка при проверке статуса: ${error.message}`;
            stopPolling();
        }
    }

    // Обработчик нажатия на кнопку "Запустить сборку"
    if (startTaskBtn) {
        startTaskBtn.addEventListener('click', async () => {
            // Всегда останавливаем предыдущий опрос перед новым запуском
            stopPolling();

            // Подготовка интерфейса
            startTaskBtn.disabled = true;
            downloadArchiveBtn.style.display = 'none';
            taskResultBox.style.display = 'block';
            taskStatusSpan.textContent = '(starting...)';
            taskOutputPre.textContent = 'Отправка запроса на запуск...';

            try {
                const response = await fetch('/api/start_task.php', { method: 'POST' });
                if (!response.ok) {
                     throw new Error(`Server responded with status: ${response.status}`);
                }
                const result = await response.json();

                if (result.status === 'started' && result.task_id) {
                    const taskId = result.task_id;
                    console.log(`Polling started for task ID: ${taskId}`);
                    // Запускаем опрос
                    taskCheckIntervalId = setInterval(() => checkTaskStatus(taskId), 3000);
                } else {
                    throw new Error(result.message || 'Сервер не смог запустить задачу.');
                }
            } catch (error) {
                taskOutputPre.textContent = `[FATAL] Критическая ошибка при запуске задачи: ${error.message}`;
                startTaskBtn.disabled = false;
            }
        });
    }


    // ===================================================================
    // Остальные секции (без изменений, просто для полноты файла)
    // ===================================================================
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        const fileInput = document.getElementById('file-input');
        const uploadResult = document.getElementById('upload-result');
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (fileInput.files.length === 0) {
                uploadResult.innerHTML = `<p class="error">Пожалуйста, выберите файлы.</p>`;
                return;
            }
            const formData = new FormData();
            for (const file of fileInput.files) { formData.append('filesToUpload[]', file); }
            uploadResult.innerHTML = `<p>Загрузка...</p>`;
            try {
                const response = await fetch('/api/upload_files.php', { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                uploadResult.innerHTML = `<p class="success">${result.message}</p>`;
                fileInput.value = '';
            } catch (error) {
                uploadResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
            }
        });
    }

    const commandForm = document.getElementById('command-form');
    if (commandForm) {
        const commandResult = document.getElementById('command-result');
        commandForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const checkedBoxes = document.querySelectorAll('input[name="command"]:checked');
            const commands = Array.from(checkedBoxes).map(cb => cb.value);
            if (commands.length === 0) {
                commandResult.innerHTML = `<p class="error">Выберите хотя бы одну команду.</p>`;
                return;
            }
            commandResult.innerHTML = `<p>Выполнение...</p>`;
            try {
                const response = await fetch('/api/execute_command.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands: commands }) });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                commandResult.innerHTML = `<p class="success">${result.message}</p><pre>${result.output}</pre>`;
            } catch (error) {
                commandResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
            }
        });
    }

    const scriptForm = document.getElementById('script-form');
    if (scriptForm) {
        const scriptInput = document.getElementById('script-input');
        const scriptResult = document.getElementById('script-result');
        scriptForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const choice = scriptInput.value;
            scriptResult.innerHTML = `<p>Запуск скрипта с выбором "${choice}"...</p>`;
            try {
                const response = await fetch('/api/execute_command.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: 'run_script', choice: choice }) });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Ошибка на сервере');
                scriptResult.innerHTML = `<p class="success">Скрипт выполнен!</p><pre>${result.output}</pre>`;
            } catch (error) {
                scriptResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
            }
        });
    }
});