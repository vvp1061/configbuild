// Финальная, исправленная версия для PHP back-end

const initialJsonData = {
    "segments": [{
        "name": "DEFAULT_SEGMENT", "base_addr": "0x0", "description": "Новый сегмент по умолчанию", "segment_size": "0x1000",
        "regs": [{ "name": "NEW_REG", "bit_size": "32", "base_addr": "0", "description": "Новый регистр", "type": "WR", "default_value": "0", "available_values": [] }]
    }]
};

let currentData;
let activeSegmentIndex = 0;

// --- DOM Элементы ---
const segmentList = document.getElementById('segment-list');
const segmentEditor = document.getElementById('segment-editor');
const registerTableBody = document.getElementById('register-table-body');
const addRegBtn = document.getElementById('add-reg-btn');
const loadFromDiskBtn = document.getElementById('load-from-disk-btn');
const loadFromServerBtn = document.getElementById('load-from-server-btn');
const saveToServerBtn = document.getElementById('save-to-server-btn');
const fileInput = document.getElementById('file-input');
const downloadBtn = document.getElementById('download-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const outputContainer = document.getElementById('output-container');
const jsonOutput = document.getElementById('json-output');

// --- Функции ---

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function loadData(jsonData) {
    currentData = jsonData;
    activeSegmentIndex = 0;
    populateSegmentNav();
    displaySegment(activeSegmentIndex);
    outputContainer.style.display = 'none';
    jsonOutput.value = '';
}

function populateSegmentNav() {
    segmentList.innerHTML = '';
    currentData.segments.forEach((segment, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = segment.name;
        a.href = '#';
        a.dataset.index = index;
        if (index === activeSegmentIndex) a.classList.add('active');
        a.addEventListener('click', (e) => {
            e.preventDefault();
            saveChangesFromUI();
            activeSegmentIndex = parseInt(e.target.dataset.index, 10);
            displaySegment(activeSegmentIndex);
        });
        li.appendChild(a);
        segmentList.appendChild(li);
    });
}

function displaySegment(segmentIndex) {
    document.querySelectorAll('#segment-list a').forEach(el => el.classList.remove('active'));
    document.querySelector(`#segment-list a[data-index='${segmentIndex}']`).classList.add('active');
    
    const segment = currentData.segments[segmentIndex];
    
    segmentEditor.innerHTML = `
        <h2>Редактирование сегмента: ${segment.name}</h2>
        <div class="form-grid">
            <div><label>Имя</label><input type="text" data-field="name" value="${segment.name}"></div>
            <div><label>Описание</label><input type="text" data-field="description" value="${segment.description}"></div>
            <div><label>Базовый адрес</label><input type="text" data-field="base_addr" value="${segment.base_addr}"></div>
            <div><label>Размер сегмента</label><input type="text" data-field="segment_size" value="${segment.segment_size}"></div>
        </div>
    `;

    registerTableBody.innerHTML = '';
    if (segment.regs) {
        segment.regs.forEach((reg, regIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" value="${reg.name}" data-field="name" data-reg-index="${regIndex}"></td>
                <td><input type="text" value="${reg.bit_size}" data-field="bit_size" data-reg-index="${regIndex}"></td>
                <td><input type="text" value="${reg.base_addr}" data-field="base_addr" data-reg-index="${regIndex}"></td>
                <td><input type="text" value="${reg.description}" data-field="description" data-reg-index="${regIndex}"></td>
                <td>
                    <select data-field="type" data-reg-index="${regIndex}">
                        <option value="WR" ${reg.type === 'WR' ? 'selected' : ''}>WR</option>
                        <option value="R" ${reg.type === 'R' ? 'selected' : ''}>R</option>
                    </select>
                </td>
                <td><input type="text" value="${reg.default_value}" data-field="default_value" data-reg-index="${regIndex}"></td>
                <td><button class="btn btn-danger btn-delete-reg" data-reg-index="${regIndex}">🗑️ Удалить</button></td>
            `;
            registerTableBody.appendChild(row);
        });
    }
}

function saveChangesFromUI() {
    if (!currentData || !currentData.segments[activeSegmentIndex]) return;
    const segment = currentData.segments[activeSegmentIndex];
    segmentEditor.querySelectorAll("input").forEach(input => {
        segment[input.dataset.field] = input.value;
    });
    if (segment.regs) {
        registerTableBody.querySelectorAll("tr").forEach(row => {
            const firstInput = row.querySelector("[data-reg-index]");
            if (firstInput) {
                const regIndex = parseInt(firstInput.dataset.regIndex, 10);
                if (segment.regs[regIndex]) {
                    row.querySelectorAll("input, select").forEach(input => {
                        const field = input.dataset.field;
                        if (field) {
                            segment.regs[regIndex][field] = input.value;
                        }
                    });
                }
            }
        });
    }
    populateSegmentNav();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            loadData(json);
        } catch (error) {
            alert("Ошибка: Не удалось прочитать или обработать JSON файл.\n" + error);
        }
    };
    reader.readAsText(file);
    fileInput.value = '';
}

async function fetchConfigFromServer() {
    const originalText = loadFromServerBtn.textContent;
    loadFromServerBtn.textContent = "Загрузка...";
    loadFromServerBtn.disabled = true;
    try {
        const response = await fetch("/api/get_config.php");
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Ошибка сервера: ${errorData.message}`);
        }
        const jsonData = await response.json();
        loadData(jsonData);
        alert("Конфигурация с сервера успешно загружена!");
    } catch (error) {
        console.error("Ошибка при загрузке с сервера:", error);
        alert(`Не удалось загрузить конфигурацию с сервера.\n\nДетали: ${error.message}`);
        loadData(deepCopy(initialJsonData));
    } finally {
        loadFromServerBtn.textContent = originalText;
        loadFromServerBtn.disabled = false;
    }
}

async function uploadConfigToServer() {
    saveChangesFromUI();
    if (confirm("Вы уверены, что хотите сохранить текущую конфигурацию на сервере?")) {
        const originalText = saveToServerBtn.textContent;
        saveToServerBtn.textContent = "Сохранение...";
        saveToServerBtn.disabled = true;
        try {
            const response = await fetch("/api/save_config.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(result.message);
        } catch (error) {
            console.error("Ошибка при сохранении на сервер:", error);
            alert(`Ошибка при сохранении на сервер.\n\nДетали: ${error.message}`);
        } finally {
            saveToServerBtn.textContent = originalText;
            saveToServerBtn.disabled = false;
        }
    }
}

// --- Инициализация и обработчики событий ---

document.addEventListener('DOMContentLoaded', () => {
    fetchConfigFromServer();

    loadFromDiskBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    loadFromServerBtn.addEventListener('click', fetchConfigFromServer);
    saveToServerBtn.addEventListener('click', uploadConfigToServer);
    
    downloadBtn.addEventListener('click', () => {
        saveChangesFromUI();
        const finalJson = JSON.stringify(currentData, null, 4);
        jsonOutput.value = finalJson;
        outputContainer.style.display = 'block';
        const blob = new Blob([finalJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'config_reg.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });

    resetAllBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите сбросить все к исходному состоянию?')) {
            loadData(deepCopy(initialJsonData));
        }
    });
    
    addRegBtn.addEventListener('click', () => {
        saveChangesFromUI();
        const newReg = {
            "name": "NEW_REGISTER", "bit_size": "32", "base_addr": "0", "description": "Новый регистр",
            "type": "WR", "default_value": "0", "available_values": []
        };
        currentData.segments[activeSegmentIndex].regs.push(newReg);
        displaySegment(activeSegmentIndex);
    });

    // ================================================================
    // ИСПРАВЛЕННЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ УДАЛЕНИЯ
    // ВАЖНО: Обработчик устанавливается на таблицу (делегирование событий)
    // ================================================================
    const registerTable = document.querySelector('.register-table');
    
    if (registerTable) {
        console.log('✅ Таблица найдена, устанавливаем обработчик удаления');
        
        registerTable.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.btn-delete-reg');

            if (deleteButton) {
                console.log('🗑️ Клик по кнопке удаления обнаружен');
                
                // КРИТИЧНО: НЕ вызываем saveChangesFromUI() здесь!
                // Иначе индексы в data-атрибутах собьются с реальными индексами массива
                
                const regIndex = parseInt(deleteButton.dataset.regIndex, 10);
                console.log('Индекс для удаления:', regIndex);
                
                // Проверка валидности индекса
                if (isNaN(regIndex) || !currentData.segments[activeSegmentIndex].regs[regIndex]) {
                    console.error('Невалидный индекс регистра:', regIndex);
                    alert('Ошибка: невалидный индекс регистра!');
                    return;
                }
                
                const regName = currentData.segments[activeSegmentIndex].regs[regIndex].name;
                
                if (confirm(`Вы уверены, что хотите удалить регистр "${regName}"?`)) {
                    // Удаляем регистр из массива
                    currentData.segments[activeSegmentIndex].regs.splice(regIndex, 1);
                    console.log('✅ Регистр удалён, перерисовываем таблицу');
                    // Перерисовываем таблицу с обновлёнными индексами
                    displaySegment(activeSegmentIndex);
                }
            }
        });
    } else {
        console.error('❌ Таблица .register-table не найдена!');
    }

    window.addEventListener('beforeunload', saveChangesFromUI);
});