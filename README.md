# Personal Blog

Персональний блог побудований на [Astro](https://astro.build/).

## Стек

- **Astro 6** — фреймворк для статичних сайтів
- **Tailwind CSS 4** — утиліти для стилізації
- **TypeScript** — типізація
- **Cloudflare Pages** — хостинг та деплой

## Локальна розробка

```bash
npm install
npm run dev
```

Сервер запускається на [http://localhost:4321](http://localhost:4321).

## Збірка

```bash
npm run build
```

Результат збірки знаходиться в папці `dist/`.

## Структура проекту

```
src/
├── layouts/
│   └── Layout.astro      # Базовий layout для всіх сторінок
├── pages/
│   └── index.astro       # Головна сторінка
└── styles/
    └── global.css        # Глобальні стилі з підключенням Tailwind

public/
├── favicon.svg           # Фавіконка для продакшн середовища
└── favicon-dev.svg       # Фавіконка для локального середовища (помаранчева)
```

## Середовища

| Середовище | Фавіконка |
|------------|-----------|
| Локальне (`npm run dev`) | Помаранчева з літерою "D" |
| Продакшн | Стандартна |

Фавіконка перемикається автоматично через `import.meta.env.DEV`.

## Деплой

Деплой налаштовано через **Cloudflare Pages** з автоматичним тригером при push у гілку `main`.

Налаштування збірки в Cloudflare Pages:
- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output directory:** `dist`

## Workflow

1. Вносимо зміни локально та перевіряємо на dev сервері
2. Після погодження — `git push origin main`
3. Cloudflare Pages автоматично збирає і публікує зміни
