document.addEventListener('DOMContentLoaded', () => {
    // --- Загрузка файлов ---
    const uploadForm = document.getElementById('upload-form');
    const uploadFileInput = document.getElementById('upload-file-input');
    const uploadResult = document.getElementById('upload-result');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!uploadFileInput.files || uploadFileInput.files.length === 0) {
                uploadResult.innerHTML = '<p class="error">Пожалуйста, выберите файлы.</p>';
                return;
            }
            const formData = new FormData();
            for (const file of uploadFileInput.files) formData.append('filesToUpload[]', file);
            uploadResult.innerHTML = '<p>Загрузка...</p>';
            try {
                const response = await fetch('/api/upload_files.php', { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Ошибка на сервере');
                uploadResult.innerHTML = `<p class="success">${result.message}</p>`;
                uploadFileInput.value = '';
            } catch (error) {
                uploadResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
            }
        });
    }

    // --- Сборка ---
    const buildForm = document.getElementById('build-form');
    const buildResultBox = document.getElementById('build-result');
    const buildStatusSpan = document.getElementById('build-status');
    const buildOutputPre = document.getElementById('build-output');

    // --- Числовая задача ---
    const numberTaskForm = document.getElementById('number-task-form');
    const numberTaskResultBox = document.getElementById('number-task-result');
    const numberTaskStatusSpan = document.getElementById('number-task-status');
    const numberTaskOutputPre = document.getElementById('number-task-output');

    // --- Подготовка архива (футер) ---
    const startProcessingBtn = document.getElementById('start-processing-btn');
    const downloadArchiveBtn = document.getElementById('download-archive-btn');
    const footerPanel = document.querySelector('.footer-panel');
    const processingResultBox = document.getElementById('processing-result');
    const processingStatusSpan = document.getElementById('processing-status');
    const processingOutputPre = document.getElementById('processing-output');

    let taskCheckIntervalId = null;

    function stopPolling() {
        if (taskCheckIntervalId) {
            clearInterval(taskCheckIntervalId);
            taskCheckIntervalId = null;
        }
    }

    async function checkTaskStatus(taskId, sinks) {
        try {
            const response = await fetch(`/api/check_task_status.php?id=${encodeURIComponent(taskId)}`);
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const result = await response.json();
            const status = (result.status || '').trim();
            const output = result.log_output || '';

            sinks.forEach(s => { if (s.output) s.output.textContent = output; });

            if (status === 'finished') {
                sinks.forEach(s => { if (s.status) s.status.textContent = 'SUCCESS'; });
                if (sinks.some(s => s.onFinished)) { sinks.forEach(s => { if (s.onFinished) s.onFinished(); }); }
                stopPolling();
            } else if (status === 'running') {
                sinks.forEach(s => { if (s.status) s.status.textContent = 'running...'; });
            } else {
                sinks.forEach(s => { if (s.status) s.status.textContent = status || 'unknown'; });
            }
        } catch (error) {
            const err = `[FATAL] Ошибка при проверке статуса: ${error.message}`;
            sinks.forEach(s => { if (s.output) s.output.textContent += `\n\n${err}`; });
            stopPolling();
        }
    }

    async function startTask(scriptKey, args, sinks) {
        const response = await fetch('/api/start_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script_key: scriptKey, args: args || [] }),
        });
        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`HTTP ${response.status}: ${txt}`);
        }
        const result = await response.json();
        if (result.status !== 'started' || !result.task_id) {
            throw new Error(result.message || 'Сервер не смог запустить задачу.');
        }
        const taskId = result.task_id;
        taskCheckIntervalId = setInterval(() => checkTaskStatus(taskId, sinks), 3000);
    }

    // --- Обработчик сборки ---
    if (buildForm) {
        buildForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const checked = Array.from(buildForm.querySelectorAll('input[name="build_part"]:checked')).map(cb => cb.value);
            if (checked.length === 0) { alert('Выберите хотя бы один модуль: kernel, fs, net'); return; }

            stopPolling();
            buildResultBox.style.display = 'block';
            buildStatusSpan.textContent = '(starting...)';
            buildOutputPre.textContent = 'Отправка запроса на запуск сборки...';

            try {
                await startTask('build', checked, [{ status: buildStatusSpan, output: buildOutputPre }]);
            } catch (error) {
                buildOutputPre.textContent = `[FATAL] Критическая ошибка при запуске сборки: ${error.message}`;
            }
        });
    }

    // --- Обработчик числовой задачи (my_script) ---
    if (numberTaskForm) {
        numberTaskForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const selected = document.querySelector('input[name="number-choice"]:checked');
            const value = selected ? selected.value : '';
            if (!value) { alert('Выберите значение от 1 до 4'); return; }

            stopPolling();
            numberTaskResultBox.style.display = 'block';
            numberTaskStatusSpan.textContent = '(starting...)';
            numberTaskOutputPre.textContent = 'Отправка запроса на запуск...';

            try {
                await startTask('my_script', [value], [{ status: numberTaskStatusSpan, output: numberTaskOutputPre }]);
            } catch (error) {
                numberTaskOutputPre.textContent = `[FATAL] Критическая ошибка при запуске: ${error.message}`;
            }
        });
    }

    // --- Обработчик долгой задачи в футере (processing_script) ---
    if (startProcessingBtn) {
        startProcessingBtn.addEventListener('click', async () => {
            stopPolling();
            startProcessingBtn.disabled = true;
            downloadArchiveBtn.style.display = 'none';
            if (footerPanel) footerPanel.classList.remove('footer-panel--success');
            processingResultBox.style.display = 'block';
            processingStatusSpan.textContent = '(starting...)';
            processingOutputPre.textContent = 'Отправка запроса на запуск...';

            try {
                await startTask('processing_script', [], [{
                    status: processingStatusSpan,
                    output: processingOutputPre,
                    onFinished: () => {
                        processingStatusSpan.textContent = 'SUCCESS';
                        downloadArchiveBtn.style.display = 'inline-flex';
                        if (footerPanel) footerPanel.classList.add('footer-panel--success');
                        startProcessingBtn.disabled = false;
                    }
                }]);
            } catch (error) {
                processingOutputPre.textContent = `[FATAL] Критическая ошибка при запуске: ${error.message}`;
                startProcessingBtn.disabled = false;
            }
        });
    }
});