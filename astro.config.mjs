// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { EnumChangefreq } from 'sitemap';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

function getArticles() {
  try {
    const data = readFileSync(resolve('./src/data/articles.json'), 'utf-8');
    return /** @type {Array<{slug: string, createdAt: string}>} */ (JSON.parse(data));
  } catch {
    return [];
  }
}

const today = new Date().toISOString().split('T')[0];

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.klymenko.space',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const articles = getArticles();
        const url = item.url;

        if (url === 'https://blog.klymenko.space/') {
          return { ...item, changefreq: EnumChangefreq.DAILY, priority: 1.0, lastmod: today };
        }

        if (url === 'https://blog.klymenko.space/articles/') {
          return { ...item, changefreq: EnumChangefreq.DAILY, priority: 0.9, lastmod: today };
        }

        const slugMatch = url.match(/\/articles\/([^/]+)\//);
        if (slugMatch) {
          const slug = slugMatch[1];
          const article = articles.find((a) => a.slug === slug);
          return {
            ...item,
            changefreq: EnumChangefreq.MONTHLY,
            priority: 0.8,
            lastmod: article?.createdAt ? article.createdAt.split('T')[0] : today,
          };
        }

        return { ...item, changefreq: EnumChangefreq.MONTHLY, priority: 0.5, lastmod: today };
      },
    }),
  ],
});