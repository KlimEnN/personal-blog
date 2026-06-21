# Personal Blog — Андрій Клименко

Персональний блог побудований на [Astro](https://astro.build/) з Notion як Headless CMS.

## Стек

- **Astro 6** — фреймворк для статичних сайтів
- **Tailwind CSS 4** — утиліти для стилізації
- **TypeScript** — типізація
- **Notion** — CMS для написання та керування статтями
- **Cloudflare Pages** — хостинг та деплой

## Дизайн-система

Мінімалізм у стилі Apple. Всі токени визначені як CSS-змінні у `src/styles/global.css`.

| Токен | Значення | Призначення |
|-------|----------|-------------|
| `--color-bg` | `#FAFAF8` | Фон сторінки |
| `--color-card` | `#FFFFFF` | Фон карток |
| `--color-ink` | `#1A1A1C` | Основний текст |
| `--color-accent` | `#6457F8` | Акцентний колір |
| `--color-secondary` | `#6A6A6F` | Вторинний текст |
| `--color-muted` | `#9A9A9F` | Приглушений текст |
| `--font-main` | Manrope | Інтерфейс та заголовки |
| `--font-serif` | Lora | Заголовки статей |
| `--radius-card` | `24px` | Радіус карток |
| `--radius-button` | `98px` | Радіус кнопок (pill) |
| `--container-max` | `1040px` | Максимальна ширина контейнера |
| `--nav-height` | `56px` | Висота навігації |

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
│   ├── Header.astro      # Sticky навігація з бургер-меню на мобільному
│   ├── Footer.astro      # Підвал з посиланнями
│   └── ArticleCard.astro # Картка статті для сітки
├── config/
│   └── site.ts           # Глобальні налаштування (назва, URL, автор, теги hero)
├── data/
│   └── articles.json     # Статті з Notion (генерується при збірці, не комітити)
├── layouts/
│   └── Layout.astro      # Базовий layout з SEO мета-тегами
├── lib/
│   └── notion.ts         # Типи та функції читання статей
├── pages/
│   ├── index.astro       # Головна: Hero + Featured + сітка статей
│   ├── about.astro       # Про мене
│   ├── articles.astro    # Список статей у вигляді сітки
│   └── articles/
│       └── [slug].astro  # Сторінка окремої статті
└── styles/
    └── global.css        # Дизайн-система: CSS-змінні, шрифти, базові стилі

public/
├── favicon.svg           # Фавіконка для продакшн
├── favicon-dev.svg       # Фавіконка для локального середовища (помаранчева)
└── robots.txt            # Дозволи для пошукових роботів
```

## Поля статті в Notion

| Поле | Тип | Призначення |
|------|-----|-------------|
| `Name` | Title | Назва статті |
| `Slug` | Text | URL (наприклад: `my-first-post`) |
| `Status` | Status | `Published` для публікації |
| `Category` | Select | Рубрика (Продукти, Аналітика, AI тощо) |
| `Description` | Text | Короткий опис для картки |
| `ReadTime` | Number | Час читання у хвилинах |
| `Featured` | Checkbox | Показувати як рекомендовану на головній |

Текст статті пишеться у тілі сторінки Notion.

## SEO

- Унікальні `title` та `description` для кожної сторінки
- Open Graph теги для шерінгу в соцмережах
- Canonical URL
- Автоматично генерований `sitemap-index.xml`
- `robots.txt`

Глобальні налаштування керуються через `src/config/site.ts`.

## Середовища

| Середовище | Фавіконка |
|------------|-----------|
| Локальне (`npm run dev`) | Помаранчева з літерою "D" |
| Продакшн | Стандартна |

Фавіконка перемикається автоматично через `import.meta.env.DEV`.

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
