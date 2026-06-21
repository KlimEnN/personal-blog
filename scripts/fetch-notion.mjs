import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

if (!token || !databaseId) {
  console.error('Missing NOTION_TOKEN or NOTION_DATABASE_ID')
  process.exit(1)
}

const notion = new Client({ auth: token })
const n2m = new NotionToMarkdown({ notionClient: notion })

console.log('Fetching articles from Notion...')

const response = await notion.databases.query({
  database_id: databaseId,
  filter: { property: 'Status', select: { equals: 'Published' } },
  sorts: [{ timestamp: 'created_time', direction: 'descending' }],
})

const articles = []

for (const page of response.results) {
  const title = page.properties.Name?.title?.[0]?.plain_text ?? 'Без назви'
  const slug = page.properties.Slug?.rich_text?.[0]?.plain_text ?? page.id
  const createdAt = page.created_time

  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const content = n2m.toMarkdownString(mdBlocks).parent

  articles.push({ id: page.id, title, slug, createdAt, content })
  console.log(`  ✓ ${title}`)
}

const outDir = join(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'articles.json'), JSON.stringify(articles, null, 2))

console.log(`Done. Saved ${articles.length} article(s).`)
