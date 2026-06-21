import { createRequire } from 'module'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { marked } from 'marked'
import { fetchArticleImage } from './image-fetcher.mjs'

const require = createRequire(import.meta.url)
const { Client } = require('@notionhq/client')

const __dirname = dirname(fileURLToPath(import.meta.url))

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

if (!token || !databaseId) {
  console.error('Missing NOTION_TOKEN or NOTION_DATABASE_ID')
  process.exit(1)
}

const notion = new Client({ auth: token })

console.log('Fetching articles from Notion...')

const response = await notion.dataSources.query({
  data_source_id: databaseId,
  filter: { property: 'Status', status: { equals: 'Published' } },
  sorts: [{ timestamp: 'created_time', direction: 'descending' }],
})

const articles = []

for (const page of response.results) {
  const title = page.properties.Name?.title?.[0]?.plain_text ?? 'Без назви'
  const slug = page.properties.Slug?.rich_text?.[0]?.plain_text ?? page.id
  const createdAt = page.created_time
  const category = page.properties.Category?.select?.name ?? null
  const description = page.properties.Description?.rich_text?.[0]?.plain_text ?? null
  const readTime = page.properties.ReadTime?.number ?? null
  const featured = page.properties.Featured?.checkbox ?? false

  const md = await notion.pages.retrieveMarkdown({ page_id: page.id })
  const content = marked(md.markdown ?? '')

  // Fetch artwork image
  let image = null
  try {
    image = await fetchArticleImage(slug)
    console.log(`  ✓ ${title}${featured ? ' ⭐' : ''} 🖼`)
  } catch (err) {
    console.warn(`  ⚠ ${title} — image failed: ${err.message}`)
    console.log(`  ✓ ${title}${featured ? ' ⭐' : ''}`)
  }

  articles.push({ id: page.id, title, slug, createdAt, category, description, readTime, featured, content, image })
}

const outDir = join(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'articles.json'), JSON.stringify(articles, null, 2))

console.log(`Done. Saved ${articles.length} article(s).`)
