import articles from '../data/articles.json'

export type ArticleImage = {
  card: string
  og: string
  alt?: string
  credit?: string
}

export type Article = {
  id: string
  title: string
  slug: string
  createdAt: string
  category: string | null
  description: string | null
  readTime: number | null
  featured: boolean
  content: string
  image: ArticleImage | null
}

export function getPublishedArticles(): Article[] {
  return articles as Article[]
}

export function getFeaturedArticle(): Article | null {
  const all = articles as Article[]
  return all.find(a => a.featured) ?? all[0] ?? null
}

export function getArticleBySlug(slug: string): Article | null {
  return (articles as Article[]).find(a => a.slug === slug) ?? null
}
