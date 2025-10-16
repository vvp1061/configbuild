// Версия для PHP back-end

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadResult = document.getElementById('upload-result');

    const commandForm = document.getElementById('command-form');
    const commandResult = document.getElementById('command-result');

    // --- Логика загрузки файлов ---
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (fileInput.files.length === 0) {
            uploadResult.innerHTML = `<p class="error">Пожалуйста, выберите файлы для загрузки.</p>`;
            return;
        }

        const formData = new FormData();
        for (const file of fileInput.files) {
            // Ключ 'filesToUpload[]' важен для PHP, чтобы он распознал массив файлов
            formData.append('filesToUpload[]', file);
        }

        uploadResult.innerHTML = `<p>Загрузка...</p>`;

        try {
            // ИЗМЕНЕНИЕ: Указываем путь к PHP-скрипту
            const response = await fetch('/api/upload_files.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Произошла ошибка на сервере.');
            }

            uploadResult.innerHTML = `<p class="success">${result.message}</p>`;
            fileInput.value = ''; // Сбрасываем input

        } catch (error) {
            uploadResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
        }
    });


    // --- Логика выполнения команд ---
    commandForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const checkedBoxes = document.querySelectorAll('input[name="command"]:checked');
        const commands = Array.from(checkedBoxes).map(cb => cb.value);

        if (commands.length === 0) {
            commandResult.innerHTML = `<p class="error">Пожалуйста, выберите хотя бы одну команду.</p>`;
            return;
        }

        commandResult.innerHTML = `<p>Выполнение...</p>`;

        try {
            // ИЗМЕНЕНИЕ: Указываем путь к PHP-скрипту
            const response = await fetch('/api/execute_command.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ commands: commands })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Произошла ошибка на сервере.');
            }

            // Используем <pre> для сохранения форматирования вывода команды
            commandResult.innerHTML = `
                <p class="success">${result.message}</p>
                <pre>${result.output}</pre>
            `;
        } catch (error) {
            commandResult.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
        }
    });
});