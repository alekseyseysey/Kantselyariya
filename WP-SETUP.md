# Настройка WordPress для КанцМир

Этот документ описывает, что нужно сделать в WP-админке, чтобы сайт работал на 100% — от глобальных текстов до плагинов оплаты.

Разделено на **бесплатные** настройки (работают сразу) и **платные** (требуют ACF Pro или сторонних плагинов; в коде frontend'а уже заложен скелет, который оживёт после установки и регистрации полей).

---

## 0. Обязательные плагины

| Плагин | Зачем | Платно? |
|---|---|---|
| **WPGraphQL** | GraphQL endpoint, без него фронт вообще не общается с WP | бесплатный |
| **WPGraphQL for WooCommerce** (WooGraphQL) | Товары, корзина, ордера через GraphQL | бесплатный |
| **WooCommerce** | Сам магазин | бесплатный |
| **Advanced Custom Fields (ACF)** | Группа `productFields` (brand, badges, paperDensity) — уже используется | бесплатный |
| **WPGraphQL for ACF** | Чтобы ACF-поля попали в GraphQL | бесплатный |
| **WP Mail SMTP** | Отправка писем через Gmail/SendGrid вместо PHP `mail()` | бесплатный |
| **Advanced Custom Fields PRO** | Repeater'ы и Options Pages — нужен для всех «списочных» настроек | **$249/год** |

---

## 1. Глобальное имя сайта (БЕСПЛАТНО)

**Где менять:** WP-админка → **Settings → General**.

| Поле | Что подставится на сайт |
|---|---|
| **Site Title** | Логотип в шапке (берутся первые 2 буквы для иконки), название в футере, копирайт `© {year} {siteName}`, `<title>` всех страниц, OpenGraph |
| **Tagline** | Описание под логотипом в футере, `<meta description>`, OpenGraph description |

После сохранения в WP — на сайте обновится автоматически за минуту (через ISR-revalidate).

---

## 2. Текстовые страницы (БЕСПЛАТНО)

Для каждой ниже — создаём WP-страницу: **Pages → Add New** → пишем заголовок и контент в Gutenberg → в блоке **Permalink** проверяем slug → **Publish**.

| Страница на сайте | Slug в WP | Где отображается |
|---|---|---|
| `/about` | `about` | Меню «О компании» |
| `/privacy` | `privacy` | Ссылка в футере |
| `/terms` | `terms` | Ссылка в футере |
| `/delivery` | `delivery` | Меню «Доставка и оплата» **И** одновременно таб «Доставка и оплата» на каждой странице товара |

В контенте можно использовать любые блоки Gutenberg: заголовки H2/H3, абзацы, списки, цитаты, таблицы, ссылки, жирный/курсив. Всё стилизуется автоматически (`prose-kantsmir`).

Если страницы со slug'ом в WP нет — на сайте показывается заглушка с инструкцией для админа.

---

## 3. Товары (БЕСПЛАТНО, через WooCommerce)

**Где:** WP-админка → **Products → Add New**.

Стандартные поля Woo:
- **Title** → название товара
- **SKU** (вкладка Inventory) → артикул
- **Regular price** / **Sale price** → цена / цена со скидкой (бейдж «Скидка» добавится автоматически)
- **Stock quantity** → остаток (0 → товар недоступен)
- **Featured image** → главное фото
- **Product gallery** → дополнительные фото
- **Short description** / **Description** → выводится в табе «Описание»
- **Categories** → категории каталога (один товар может быть в нескольких — фильтр в каталоге это поддерживает)
- **Featured product** (галка справа) → попадёт в карусель «Популярные товары» на главной

**ACF-поля (группа `productFields`)** — заполняются под товаром:
- **brand** — бренд
- **badges** — checkbox: `hit`, `new`, `bestseller` (бейдж `sale` ставится автоматически из `onSale`)
- **paperDensity** — плотность бумаги (для тетрадей и т.п. — попадает в спеку)

---

## 4. Категории товаров (БЕСПЛАТНО, через WooCommerce)

**Где:** WP-админка → **Products → Categories**.

ACF-группа `productCategoryFields` (опционально) — кастомизация плиток в каталоге:
- **emoji** — иконка категории
- **color** — акцентный цвет
- **iconBg** — цвет фона плитки

---

## 5. Доставка (БЕСПЛАТНО, через WooCommerce)

**Где:** WP-админка → **WooCommerce → Settings → Shipping**.

1. **Add zone** → имя `Беларусь` → `Zone regions = Belarus`.
2. Внутри зоны → **Add shipping method** → один из:
   - **Free shipping** (с условием Order minimum amount = 50)
   - **Flat rate** (если хотите фиксированную цену доставки)
   - **Local pickup** (самовывоз, цена 0)

Без хотя бы одного метода в зоне `checkout` упадёт с ошибкой «No shipping methods available».

---

## 6. Оплата (БЕСПЛАТНО + опциональные платные гейтвеи)

**Где:** WP-админка → **WooCommerce → Settings → Payments**.

Бесплатные методы из коробки:
- **Cash on delivery** (`cod`) — оплата курьеру
- **Direct bank transfer** (`bacs`) — для юрлиц (вы прописываете реквизиты — они уйдут клиенту в письме)

Платные онлайн-эквайринги (любой можно поставить отдельно — фронт менять не надо):
- **Bepaid for WooCommerce** (РБ-эквайринг + ЕРИП) — ~$200–300/год
- **WebPay** (БСБ Банк, РБ) — по тарифу банка
- **WooCommerce Stripe Payment Gateway** (международные карты) — бесплатный плагин, комиссия Stripe 1.4–2.9%

После установки гейтвея — он автоматически появится как ещё один способ оплаты в checkout'е сайта (нужно в коде добавить `<label>` с `value="<метод>"` — это указано прямо в `app/checkout/page.tsx` в комментарии).

---

## 7. Email-уведомления (БЕСПЛАТНО, нужен SMTP-плагин)

**Где:** WP-админка → **WooCommerce → Settings → Emails**.

Пройтись по списку (New order, Cancelled, Failed, Processing, Completed, Refunded) — проверить:
- **Recipient** — куда уходит копия админу
- **Subject** / **Email heading** — заголовки писем

**Важно:** Local By Flywheel и большинство shared-хостингов **не доставляют** письма наружу через PHP `mail()`. Решение:

1. Установить плагин **WP Mail SMTP**.
2. WP-админка → **WP Mail SMTP → Settings**.
3. Mailer = `Other SMTP` (или Gmail / SendGrid / Mailgun — у каждого свой мастер настройки).
4. Для Gmail SMTP:
   - Host: `smtp.gmail.com`, Port: `465`, Encryption: `SSL`
   - Username: ваш Gmail
   - Password: **App Password** (не основной пароль!) — генерируется в Google Account → Security → 2-Step Verification → App passwords.
5. **Send test email** — проверить, что доходит.

---

## 8. Заявки оптовиков (БЕСПЛАТНО, отдельный плагин)

В папке проекта `wp-plugins/kantsmir-wholesale/` — готовый плагин. Установка:
1. Скопировать папку в `app/public/wp-content/plugins/`.
2. **Plugins → Activate**.
3. В меню админки появится **«Заявки оптовиков»**.

Email уведомлений — определяется константой `KANTSMIR_NOTIFY_EMAIL` (по умолчанию `leha.aleksey200258@gmail.com`). Поменять можно в `wp-config.php`:
```php
define('KANTSMIR_NOTIFY_EMAIL', 'sales@example.com');
```

---

## 9. Отзывы (БЕСПЛАТНО, через WooCommerce)

**Где:** WP-админка → **WooCommerce → Settings → Products → General**:
- ☑ Enable product reviews
- ☑ Enable star rating on reviews
- ☐ Comment author must have a previously approved comment (выключите, иначе первый отзыв любого нового пользователя зависнет на модерации)

WP-админка → **Settings → Discussion**:
- **Comment must be manually approved** — если включено, отзывы попадают в очередь модерации; одобрить можно в **Comments**.

---

## 10. ⚠️ ACF Pro Options Page (ПЛАТНО — $249/год)

Когда у вас будет ACF Pro — вы сможете редактировать в админке:
- логотип сайта (картинка вместо градиентного блока «КМ»)
- фоновую картинку Hero-секции
- весь текст Hero (заголовок, подзаголовок, бейдж, CTA-кнопки, статистика)
- слайды промо-карусели
- список FAQ
- список телефонов / мессенджеров / соцсетей
- адрес и режим работы
- колонки футера (Company / Buyers / Catalog) и ссылки в них
- footer-note внизу

### Установка

1. Купить ACF Pro: https://www.advancedcustomfields.com/pro/
2. В WP-админке: **Plugins → Upload Plugin** → загрузить `.zip`.
3. **Plugins → Activate**.
4. В `functions.php` темы (или маленьком плагине) добавить:
   ```php
   if (function_exists('acf_add_options_page')) {
       acf_add_options_page([
           'page_title' => 'Настройки темы',
           'menu_title' => 'Настройки темы',
           'menu_slug'  => 'theme-settings',
           'capability' => 'edit_posts',
       ]);
   }
   ```
5. **Custom Fields → Field Groups → Add New** → имя `Theme Settings`. Внутри:
   - Location: **Options Page = Настройки темы**
   - Show in GraphQL: **on**
   - GraphQL Field Name: `themeSettings`

### Поля группы

| Field name | Field type | GraphQL name | Назначение |
|---|---|---|---|
| Logo | Image (Array) | `logo` | Логотип в шапке/футере |
| Hero Background Image | Image | `heroBackgroundImage` | Фон Hero-секции |
| Hero Badge | Text | `heroBadge` | Метка над H1 |
| Hero Heading | Text | `heroHeading` | Главный H1 (без выделения) |
| Hero Heading Highlight | Text | `heroHeadingHighlight` | Выделенная цветом часть H1 |
| Hero Subheading | Textarea | `heroSubheading` | Текст под H1 |
| Hero Primary CTA Label / URL | Text / URL | `heroPrimaryCtaLabel`, `heroPrimaryCtaUrl` | Главная кнопка |
| Hero Secondary CTA Label / URL | Text / URL | `heroSecondaryCtaLabel`, `heroSecondaryCtaUrl` | Вторая кнопка |
| Hero Stats | **Repeater** (`value`, `label`) | `heroStats` | Цифры под Hero |
| Promo Slides | **Repeater** (`heading`, `subheading`, `cta`, `ctaHref`, `bgFrom`, `bgTo`, `emoji`) | `promoSlides` | Слайды акций |
| Footer Columns | **Repeater** (`title`, и вложенный Repeater `links: { label, href }`) | `footerColumns` | Колонки футера |
| Footer Note | Textarea | `footerNote` | Текст под футером |
| Phones | **Repeater** (`number`, `label`) | `phones` | Телефоны контактов |
| Messengers | **Repeater** (`name`, `href`, `emoji`) | `messengers` | Telegram/Viber/WhatsApp |
| Socials | **Repeater** (`name`, `href`, `emoji`) | `socials` | Instagram/VK/TikTok/YouTube |
| Address | Textarea | `address` | Адрес офиса |

### Активация в коде frontend'а

В файле `frontend/lib/wp-api.ts` найдите блок:
```ts
/* ─── Theme Settings (ACF Pro Options Page — закомментировано) ─── */
// const THEME_SETTINGS_QUERY = ...
// export interface ThemeSettings { ... }
// export async function fetchThemeSettings(): Promise<ThemeSettings | null> { ... }
```
**Раскомментируйте** этот блок целиком, потом обновите:
- `app/layout.tsx` — добавьте `await fetchThemeSettings()` рядом с `fetchSiteSettings()`, и пробросьте в Header/Footer.
- `Header.tsx` / `Footer.tsx` — рендерите `themeSettings.logo.sourceUrl` через `<Image>` вместо градиентного блока, `themeSettings.footerColumns.map(...)` вместо хардкоженных массивов.
- `HeroSection.tsx` — fetchHero уже умеет принимать `HeroContent`, нужно лишь обновить `lib/wp-api.ts:fetchHero` чтобы он сначала смотрел в `themeSettings`.

Аналогично для `fetchPromoSlides`, `fetchContacts`, `fetchFaqItems` — у каждого fetcher'а уже есть закомментированный путь через ACF Pro.

---

## 11. Что нужно делать админу регулярно (после полной настройки)

| Задача | Где |
|---|---|
| Опубликовать товар | Products → Add New |
| Изменить цену / остаток | Products → конкретный товар |
| Принять заказ | WooCommerce → Orders → Mark as processing → отгрузить → Mark complete |
| Изменить текст «Доставка» / «О компании» / «Privacy» | Pages → конкретная страница → редактор Gutenberg |
| Поменять название сайта | Settings → General → Site Title |
| Одобрить отзыв (если модерация) | Comments |
| Принять заявку оптовика | Заявки оптовиков → конкретная заявка |
| Изменить адрес/телефоны/Hero/footer (после ACF Pro) | Настройки темы (в боковом меню) |

---

## 12. Cheat sheet — что где живёт

| Что меняется на сайте | Где менять | Зависит от |
|---|---|---|
| Имя сайта в шапке/футере/title | Settings → General → Site Title | бесплатно |
| Текст «О компании» | Pages → about | бесплатно |
| Политика конфиденциальности | Pages → privacy | бесплатно |
| Пользовательское соглашение | Pages → terms | бесплатно |
| Доставка (страница и таб товара) | Pages → delivery | бесплатно |
| Категории / товары / цены / остатки | Products → ... | бесплатно |
| Способы доставки | WooCommerce → Settings → Shipping | бесплатно |
| Способы оплаты | WooCommerce → Settings → Payments | бесплатно |
| Email-уведомления | WooCommerce → Settings → Emails + WP Mail SMTP | бесплатно |
| Бренд/badges/плотность товара | поле под товаром (ACF group `productFields`) | бесплатно |
| Логотип-картинка | ⚠️ Настройки темы → Logo | **ACF Pro** |
| Hero-секция (текст/фон/CTA) | ⚠️ Настройки темы → Hero | **ACF Pro** |
| Промо-слайдер | ⚠️ Настройки темы → Promo Slides | **ACF Pro** |
| FAQ-список | ⚠️ Настройки темы → FAQ | **ACF Pro** |
| Список телефонов / мессенджеров / соцсетей | ⚠️ Настройки темы | **ACF Pro** |
| Колонки футера | ⚠️ Настройки темы → Footer Columns | **ACF Pro** |
| Адрес офиса | ⚠️ Настройки темы → Address | **ACF Pro** |
