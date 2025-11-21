

---

### Чеклист для деплоя на новом сервере (Ubuntu 20.04 / 22.04)

#### Часть I: Необходимые зависимости

На чистой виртуальной машине вам понадобится установить всего 4 компонента:

1.  **Веб-сервер Nginx:** Принимает запросы и отдает статические файлы.
2.  **PHP-FPM:** Выполняет PHP-скрипты.
3.  **PHP-ZIP:** Расширение для PHP, необходимое для создания архивов.
4.  **Git:** Для удобного скачивания вашего проекта из репозитория.

**Команда для установки всего сразу:**
```bash
sudo apt update
sudo apt install -y nginx php8.1-fpm php8.1-zip git
```

#### Часть II: Шаги по развертыванию

##### Шаг 1: Подготовка пользователя и директорий

1.  **Создайте выделенного пользователя** для приложения.
    ```bash
    sudo useradd --create-home --shell /bin/bash appuser
    ```

2.  **Клонируйте проект** из Git-репозитория в домашнюю директорию этого пользователя.
    ```bash
    # Переключаемся на нового пользователя
    sudo -i -u appuser

    # Клонируем репозиторий (замените URL на свой)
    git clone https://github.com/ваш_логин/ваш_репозиторий.git json-configurator
    
    # Выходим обратно в root или вашего основного пользователя
    exit
    ```

3.  **Создайте необходимые рабочие папки,** которые не хранятся в Git (согласно `.gitignore`).
    ```bash
    cd /home/appuser/json-configurator
    sudo mkdir data uploads processed_files logs data/backups
    ```

4.  **Создайте пустой `config_reg.json`** на основе вашего файла-примера.
    ```bash
    sudo cp data/config_reg.json.example data/config_reg.json
    ```

##### Шаг 2: Настройка Nginx

1.  **Создайте новый файл конфигурации** для сайта.
    ```bash
    sudo nano /etc/nginx/sites-available/json-configurator
    ```

2.  **Скопируйте и вставьте** в него рабочую конфигурацию. **Заменить `your_new_server_ip` на IP-адрес нового сервера.**

    ```nginx
    server {
        listen 80;
        listen [::]:80;

        server_name your_new_server_ip;

        root /home/appuser/json-configurator/public;
        index index.html index.php;

        location / {
            try_files $uri $uri/ =404;
        }

        location ~ ^/api/.*\.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        }

        location ~ \.php$ {
            deny all;
        }
    }
    ```

3.  **Активируйте новый сайт** и удалите конфигурацию по умолчанию.
    ```bash
    sudo ln -s /etc/nginx/sites-available/json-configurator /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    ```

##### Шаг 3: Настройка прав доступа

1.  **Назначьте правильного владельца (`appuser`) и группу (`www-data`):**
    ```bash
    sudo chown -R appuser:www-data /home/appuser/json-configurator
    ```
2.  **Дайте группе `www-data` права на вход в домашнюю директорию `appuser`:**
    ```bash
    sudo chmod 750 /home/appuser
    ```
3.  **Установите права на папки внутри проекта:**
    ```bash
    sudo find /home/appuser/json-configurator -type d -exec chmod 775 {} \;
    ```
4.  **Установите права на файлы внутри проекта:**
    ```bash
    sudo find /home/appuser/json-configurator -type f -exec chmod 664 {} \;
    ```
5.  **Сделайте все bash-скрипты исполняемыми:**
    ```bash
    sudo chmod +x /home/appuser/json-configurator/*.sh
    ```

##### Шаг 4: Настройка брандмауэра `ufw`

1.  **Разрешите необходимые службы:**
    ```bash
    sudo ufw allow 'Nginx HTTP'  # Открывает порт 80
    sudo ufw allow 'OpenSSH'      # Разрешает SSH-подключения
    ```
2.  **Включите брандмауэр:**
    ```bash
    sudo ufw enable
    ```
    (Введите `y` для подтверждения)

##### Шаг 5: Финальный запуск

1.  **Проверьте конфигурацию Nginx:**
    ```bash
    sudo nginx -t
    ```
2.  **Перезапустите службы,** чтобы применить все изменения:
    ```bash
    sudo systemctl restart nginx
    sudo systemctl restart php8.1-fpm
    ```

---
