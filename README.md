# blog.klymenko.space

Персональний блог Андрія Клименка. [blog.klymenko.space](https://blog.klymenko.space)

## Стек

- **[Astro 6](https://astro.build)** — статична генерація сайту
- **[Tailwind CSS 4](https://tailwindcss.com)** + `@tailwindcss/typography`
- **[Notion](https://notion.so)** — headless CMS (статті пишуться в Notion)
- **[Cloudflare Pages](https://pages.cloudflare.com)** — хостинг + CDN
- **[Met Museum API](https://metmuseum.github.io)** — artwork зображення для статей (public domain)
- **sharp** — оптимізація зображень у WebP

## Дизайн-система

Всі токени визначені як CSS-змінні у `src/styles/global.css`.

| Токен | Значення |
|-------|----------|
| `--color-bg` | `#FAFAF8` |
| `--color-ink` | `#1A1A1C` |
| `--color-accent` | `#6457F8` |
| `--font-main` | Manrope |
| `--font-serif` | Lora (заголовки статей) |
| `--container-max` | `1040px` |

## Локальна розробка

### 1. Клонувати і встановити залежності

```bash
git clone https://github.com/KlimEnN/personal-blog.git
cd personal-blog
npm install
```

### 2. Налаштувати змінні середовища

```bash
cp .env.example .env
# Заповнити NOTION_TOKEN і NOTION_DATABASE_ID
```

### 3. Запустити dev-сервер

```bash
npm run dev
```

При першому запуску автоматично підтягне статті з Notion.

## Скрипти

| Команда | Опис |
|---------|------|
| `npm run dev` | Dev-сервер (авто-фетч Notion якщо немає `articles.json`) |
| `npm run build` | Фетч Notion → type check → astro build |
| `npm run check` | TypeScript перевірка через `astro check` |
| `npm run preview` | Переглянути production білд локально |

## Контент (Notion)

Статті — у Notion базі даних. Поля:

| Поле | Тип | Опис |
|------|-----|------|
| `Name` | title | Заголовок статті |
| `Slug` | rich_text | URL slug — лише `a-z`, `0-9`, `-` (обов'язково) |
| `Status` | status | `Draft` / `Published` |
| `Category` | select | Категорія |
| `Description` | rich_text | Опис до 160 символів |
| `ReadTime` | number | Час читання в хвилинах |
| `Featured` | checkbox | Показати як рекомендоване на головній |

Текст статті — у тілі Notion-сторінки.

## Зображення

Кожна стаття автоматично отримує зображення шедевра з [Met Museum API](https://metmuseum.github.io):

- Вибір детермінований від slug — одна стаття = завжди одне зображення
- Форматуються у WebP: `card.webp` (800×480) і `og.webp` (1200×630)
- Зберігаються у `public/images/articles/{slug}/` і закомічені в git
- Білд **не залежить** від зовнішнього API
- Твори художників з Росії, СРСР, Російської Імперії — виключені

## Структура проекту

```
scripts/
├── fetch-notion.mjs     # Фетч статей з Notion + запуск image-fetcher
├── image-fetcher.mjs    # Завантаження і оптимізація artwork зображень
├── ensure-data.mjs      # Авто-фетч articles.json якщо відсутній (для dev)
└── generate-og.mjs      # Генерація дефолтного OG-зображення

src/
├── components/
│   ├── Header.astro     # Sticky навігація з бургер-меню
│   ├── Footer.astro     # Підвал
│   └── ArticleCard.astro
├── config/site.ts       # Глобальні налаштування сайту
├── data/articles.json   # Генерується при збірці (gitignored)
├── layouts/Layout.astro # SEO, OG, Twitter Card, article:published_time
├── lib/notion.ts        # Типи Article + функції читання
└── pages/
    ├── index.astro
    ├── about.astro
    ├── articles.astro
    ├── 404.astro
    └── articles/[slug].astro

public/
├── _headers             # Security headers (Cloudflare Pages)
├── images/articles/     # Artwork зображення (закомічені)
├── og-default.webp      # Дефолтне OG-зображення для головної
└── robots.txt
```

## SEO

- `og:type="article"` для сторінок статей
- `article:published_time` у мета-тегах
- `datetime` атрибут на всіх `<time>` елементах
- Унікальне OG-зображення для кожної статті (1200×630 WebP)
- Дефолтне OG-зображення для головної сторінки
- Canonical URL + sitemap

## Security headers

Cloudflare Pages застосовує заголовки з `public/_headers`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

## Деплой

Push у `main` → Cloudflare Pages автоматично запускає:

```
node scripts/fetch-notion.mjs → astro check → astro build
```

Змінні середовища в Cloudflare (Settings → Variables and secrets):
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
