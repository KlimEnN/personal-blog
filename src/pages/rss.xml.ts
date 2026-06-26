import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getPublishedArticles } from '../lib/notion'
import { SITE } from '../config/site'

export function GET(context: APIContext) {
  const articles = getPublishedArticles()

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.date || article.createdAt),
      description: article.description ?? undefined,
      link: `/articles/${article.slug}/`,
      categories: article.category ? [article.category] : [],
    })),
    customData: `<language>uk</language>`,
  })
}
