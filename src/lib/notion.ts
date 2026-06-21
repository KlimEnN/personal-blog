import articles from '../data/articles.json'

export type Article = {
  id: string
  title: string
  slug: string
  createdAt: string
  content: string
}

export function getPublishedArticles(): Article[] {
  return articles as Article[]
}

export function getArticleBySlug(slug: string): Article | null {
  return (articles as Article[]).find(a => a.slug === slug) ?? null
}
