// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

function getArticles() {
  try {
    const data = readFileSync(resolve('./src/data/articles.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

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

        // Homepage
        if (url === 'https://blog.klymenko.space/') {
          return { ...item, changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString().split('T')[0] };
        }

        // Articles listing
        if (url === 'https://blog.klymenko.space/articles/') {
          return { ...item, changefreq: 'daily', priority: 0.9, lastmod: new Date().toISOString().split('T')[0] };
        }

        // Individual article pages
        const slugMatch = url.match(/\/articles\/([^/]+)\//);
        if (slugMatch) {
          const slug = slugMatch[1];
          const article = articles.find((a) => a.slug === slug);
          return {
            ...item,
            changefreq: 'monthly',
            priority: 0.8,
            lastmod: article?.createdAt ? article.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          };
        }

        // About and other static pages
        return { ...item, changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString().split('T')[0] };
      },
    }),
  ],
});