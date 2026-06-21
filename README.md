# Personal Blog

Персональний блог побудований на [Astro](https://astro.build/) з Notion як Headless CMS.

## Стек

- **Astro 6** — фреймворк для статичних сайтів
- **Tailwind CSS 4** — утиліти для стилізації
- **TypeScript** — типізація
- **Notion** — CMS для написання та керування статтями
- **Cloudflare Pages** — хостинг та деплой

## Локальна розробка

```bash
npm install
npm run dev
```

Сервер запускається на [http://localhost:4321](http://localhost:4321).

## Змінні середовища

Створіть файл `.env` у корені проекту:

```
NOTION_TOKEN=ваш_токен_інтеграції
NOTION_DATABASE_ID=id_вашої_бази_даних
```

Отримати токен можна на [notion.so/my-integrations](https://www.notion.so/my-integrations).

## Збірка

```bash
npm run build
```

Команда виконує два кроки:
1. `node scripts/fetch-notion.mjs` — завантажує статті з Notion і зберігає у `src/data/articles.json`
2. `astro build` — генерує статичний сайт у папці `dist/`

## Структура проекту

```
scripts/
└── fetch-notion.mjs      # Скрипт отримання статей з Notion API

src/
├── components/
│   └── Header.astro      # Навігація сайту
├── config/
│   └── site.ts           # Глобальні налаштування сайту (назва, URL, автор)
├── data/
│   └── articles.json     # Статті згенеровані з Notion (не комітити)
├── layouts/
│   └── Layout.astro      # Базовий layout з SEO мета-тегами
├── lib/
│   └── notion.ts         # Функції для читання статей з articles.json
├── pages/
│   ├── index.astro       # Головна сторінка
│   ├── about.astro       # Сторінка "Про мене"
│   ├── articles.astro    # Список статей
│   └── articles/
│       └── [slug].astro  # Сторінка окремої статті
└── styles/
    └── global.css        # Глобальні стилі з Tailwind

public/
├── favicon.svg           # Фавіконка для продакшн середовища
├── favicon-dev.svg       # Фавіконка для локального середовища (помаранчева)
└── robots.txt            # Дозволи для пошукових роботів
```

## SEO

- Унікальні `title` та `description` для кожної сторінки
- Open Graph теги для шерінгу в соцмережах
- Canonical URL
- Автоматично генерований `sitemap-index.xml`
- `robots.txt`

Глобальні налаштування SEO керуються через `src/config/site.ts`.

## Середовища

| Середовище | Фавіконка |
|------------|-----------|
| Локальне (`npm run dev`) | Помаранчева з літерою "D" |
| Продакшн | Стандартна |

Фавіконка перемикається автоматично через `import.meta.env.DEV`.

## Керування статтями в Notion

1. Відкрийте базу даних **Blog** у Notion
2. Натисніть **+ New page** для створення нової статті
3. Заповніть поля:
   - **Name** — назва статті
   - **Slug** — URL-адреса (наприклад: `my-first-post`)
   - **Status** — `Published` для публікації
4. Клікніть на назву статті та напишіть текст у тілі сторінки
5. Запустіть деплой

## Деплой

Деплой налаштовано через **Cloudflare Pages** + **Wrangler** з автоматичним тригером при push у гілку `main`.

Налаштування збірки (`wrangler.toml`):
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Compatibility flag:** `nodejs_compat`

Змінні середовища в Cloudflare (Build → Variables and secrets):
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

## Workflow

1. Пишемо або оновлюємо статтю в Notion
2. Перевіряємо локально: `npm run build && npm run preview`
3. Після погодження — `git push origin main`
4. Cloudflare автоматично збирає і публікує сайт
