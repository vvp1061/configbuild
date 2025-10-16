// Версия для PHP back-end с запуском bash-скрипта и скачиванием архива

document.addEventListener('DOMContentLoaded', () => {
    // --- Секция загрузки файлов ---
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadResult = document.getElementById('upload-result');

    // --- Секция простых команд ---
    const commandForm = document.getElementById('command-form');
    const commandResult = document.getElementById('command-result');

    // --- Секция запуска скрипта с параметром ---
    const scriptForm = document.getElementById('script-form');
    const scriptInput = document.getElementById('script-input');
    const scriptResult = document.getElementById('script-result');

    // --- НОВАЯ СЕКЦИЯ: Создание и скачивание архива ---
    const createArchiveBtn = document.getElementById('create-archive-btn');
    const archiveResult = document.getElementById('archive-result');


    // --- Логика загрузки файлов ---
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (fileInput.files.length === 0) {
                uploadResult.innerHTML = `<p class="error">Пожалуйста, выберите файлы.</p>`;
                return;
            }
            const formData = new FormData();
            for (const file of fileInput.files) {
                formData.append('filesToUpload[]', file);
            }
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

    // --- Логика выполнения простых команд ---
    if (commandForm) {
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
                const response = await fetch('/api/execute_command.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ commands: commands })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                commandResult.innerHTML = `<p class="success">${result.message}</p><pre>${result.output}</pre>`;
            } catch (error) {
                commandResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
            }
        });
    }

    // --- Логика: Выполнение bash-скрипта с параметром ---
    if (scriptForm) {
        scriptForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const choice = scriptInput.value;
            scriptResult.innerHTML = `<p>Запуск скрипта с выбором "${choice}"...</p>`;

            try {
                const response = await fetch('/api/execute_command.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        command: 'run_script',
                        choice: choice 
                    })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Ошибка на сервере');

                scriptResult.innerHTML = `<p class="success">Скрипт выполнен!</p><pre>${result.output}</pre>`;
            } catch (error) {
                scriptResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
            }
        });
    }

    // --- НОВАЯ ЛОГИКА: Создание и скачивание архива ---
    if (createArchiveBtn) {
        createArchiveBtn.addEventListener('click', () => {
            archiveResult.innerHTML = `<p>Запуск обработки... Это может занять некоторое время. Пожалуйста, подождите.</p>`;
            createArchiveBtn.disabled = true;
            
            // Мы не используем fetch, так как нам нужно, чтобы браузер обработал
            // скачивание файла. Мы просто перенаправляем браузер на URL нашего PHP-скрипта.
            // Браузер сам инициирует скачивание, когда получит правильные заголовки от сервера.
            window.location.href = '/api/create_and_download_archive.php';

            // Через несколько секунд снова активируем кнопку и очищаем статус.
            // Это нужно, потому что мы не получаем ответа от сервера (браузер "перехватывает" его для скачивания).
            setTimeout(() => {
                archiveResult.innerHTML = `<p class="success">Запрос на скачивание отправлен. Если загрузка не началась, проверьте консоль браузера на наличие ошибок.</p>`;
                createArchiveBtn.disabled = false;
            }, 4000); // 4 секунды
        });
    }
});