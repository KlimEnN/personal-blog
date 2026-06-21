import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

function createClient() {
  const token = import.meta.env.NOTION_TOKEN ?? process.env.NOTION_TOKEN
  return new Client({ auth: token })
}

const DATABASE_ID =
  import.meta.env.NOTION_DATABASE_ID ?? process.env.NOTION_DATABASE_ID ?? ''

export async function getPublishedArticles() {
  const notion = createClient()

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties.Name?.title?.[0]?.plain_text ?? 'Без назви',
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text ?? page.id,
    createdAt: page.created_time,
  }))
}

export async function getArticleBySlug(slug: string) {
  const articles = await getPublishedArticles()
  const article = articles.find(a => a.slug === slug)
  if (!article) return null

  const notion = createClient()
  const n2m = new NotionToMarkdown({ notionClient: notion })
  const mdBlocks = await n2m.pageToMarkdown(article.id)
  const content = n2m.toMarkdownString(mdBlocks).parent

  return { ...article, content }
}
