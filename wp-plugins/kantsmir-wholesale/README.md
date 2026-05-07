# KantsMir — Wholesale Requests (WP plugin)

Принимает POST `multipart/form-data` от фронта Next.js, валидирует, кладёт заявку в CPT `wholesale_request` и шлёт уведомление на email администратора.

## Установка в Local By Flywheel

1. В Local нажмите правой кнопкой на сайт → **Reveal in File Explorer**.
2. Перейдите в `app/public/wp-content/plugins/`.
3. Скопируйте сюда папку `kantsmir-wholesale/` целиком.
4. В админке WordPress **Plugins → Installed Plugins** → активируйте «KantsMir — Wholesale Requests».
5. В левом меню админки появится пункт **«Заявки оптовиков»**.

## Конфигурация

По умолчанию письма идут на `leha.aleksey200258@gmail.com`. Чтобы поменять, добавьте в `wp-config.php`:

```php
define('KANTSMIR_NOTIFY_EMAIL', 'sales@example.com');
```

## REST endpoint

```
POST /wp-json/kantsmir/v1/wholesale
Content-Type: multipart/form-data
```

Поля:
- `name` (string, ≥2)
- `phone` (string, ≥9)
- `email` (string, валидный email)
- `orgType` (string, не пустой)
- `comment` (string, опционально)
- `consent` (boolean, обязательно `true`)
- `website` (honeypot — должно быть пусто, иначе тихо игнорируется)
- `attachment` (file, опционально — PDF/DOC/DOCX/XLS/XLSX, до 10 МБ)

Ответ:
```json
{ "ok": true, "id": 123 }
```

При ошибке:
```json
{ "ok": false, "error": "invalid_email", "message": "Введите корректный e-mail" }
```

## Где смотреть письма в Local By Flywheel

Local в новых версиях ловит исходящую SMTP-почту через встроенный **Mailpit** (вкладка «Mailpit» / «Tools → Mailpit» в Local). Реальные письма на Gmail с `localhost`-а уйдут только если настроен внешний SMTP — например, плагин **WP Mail SMTP** с Gmail SMTP / Mailtrap / Sendgrid.
