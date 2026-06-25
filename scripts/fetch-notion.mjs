import { createRequire } from 'module'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { marked } from 'marked'
import { fetchArticleImage } from './image-fetcher.mjs'
import sanitizeHtml from 'sanitize-html'

const require = createRequire(import.meta.url)
const { Client } = require('@notionhq/client')

const __dirname = dirname(fileURLToPath(import.meta.url))

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

if (!token || !databaseId) {
  console.error('Missing NOTION_TOKEN or NOTION_DATABASE_ID')
  process.exit(1)
}

// Slug must be lowercase alphanumeric + hyphens, no path traversal
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') return false
  if (slug.length > 200) return false
  return SLUG_REGEX.test(slug)
}

const notion = new Client({ auth: token })

console.log('Fetching articles from Notion...')

// Fetch all pages with pagination
const allPages = []
let cursor = undefined
do {
  const response = await notion.dataSources.query({
    data_source_id: databaseId,
    filter: { property: 'Status', status: { equals: 'Published' } },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    ...(cursor ? { start_cursor: cursor } : {}),
  })
  allPages.push(...response.results)
  cursor = response.has_more ? response.next_cursor : undefined
} while (cursor)

const articles = []
const seenSlugs = new Set()

for (const page of allPages) {
  const title = page.properties.Name?.title?.[0]?.plain_text ?? 'Без назви'
  const rawSlug = page.properties.Slug?.rich_text?.[0]?.plain_text ?? ''

  // Validate slug
  if (!validateSlug(rawSlug)) {
    console.warn(`  ⚠ Skipping "${title}" — invalid slug: "${rawSlug}"`)
    continue
  }

  // Check for duplicates
  if (seenSlugs.has(rawSlug)) {
    console.warn(`  ⚠ Skipping "${title}" — duplicate slug: "${rawSlug}"`)
    continue
  }
  seenSlugs.add(rawSlug)

  const slug = rawSlug
  const createdAt = page.created_time
  const category = page.properties.Category?.select?.name ?? null
  const rawCategorySlug = page.properties.CategorySlug?.rich_text?.[0]?.plain_text?.trim() ?? null
  const categorySlug = rawCategorySlug && validateSlug(rawCategorySlug) ? rawCategorySlug : null
  const rawDescription = page.properties.Description?.rich_text?.[0]?.plain_text ?? null
  const description = rawDescription ? rawDescription.slice(0, 160) : null
  const rawReadTime = page.properties.ReadTime?.number ?? null
  const readTime = typeof rawReadTime === 'number' && rawReadTime > 0 ? Math.round(rawReadTime) : null
  const featured = page.properties.Featured?.checkbox ?? false

  const md = await notion.pages.retrieveMarkdown({ page_id: page.id })

  if (md.truncated) {
    console.warn(`  ⚠ "${title}" content is truncated by Notion API`)
  }

  const rawHtml = marked(md.markdown ?? '')
  const content = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'img', 'figure', 'figcaption',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading'],
      code: ['class'],
      pre: ['class'],
    },
  })

  // Fetch artwork image
  let image = null
  try {
    image = await fetchArticleImage(slug)
    console.log(`  ✓ ${title}${featured ? ' ⭐' : ''} 🖼`)
  } catch (err) {
    console.warn(`  ⚠ ${title} — image failed: ${err.message}`)
    console.log(`  ✓ ${title}${featured ? ' ⭐' : ''}`)
  }

  articles.push({ id: page.id, title, slug, createdAt, category, categorySlug, description, readTime, featured, content, image })
}

const outDir = join(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'articles.json'), JSON.stringify(articles, null, 2))

console.log(`Done. Saved ${articles.length} article(s).`)
