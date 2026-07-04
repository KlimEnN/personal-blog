/**
 * Internal linking integrity test.
 * Runs after fetch-notion.mjs, before astro build.
 *
 * Checks:
 *  1. No Notion internal links (app.notion.com/blog/*) leak into content
 *  2. Every internal blog link (/articles/[slug]/) points to an existing article
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const articlesPath = join(__dirname, '../src/data/articles.json')

const articles = JSON.parse(readFileSync(articlesPath, 'utf-8'))
const existingSlugs = new Set(articles.map(a => a.slug))

const SITE = 'https://klymenko.space'
const INTERNAL_LINK_RE = new RegExp(`href="${SITE}/articles/([^/"]+)/?"`, 'g')
const NOTION_LINK_RE = /href="https?:\/\/app\.notion\.com\/blog\/([^"]+)"/g

let errors = 0

for (const article of articles) {
  const { slug, content } = article

  // Rule 1: no leaked Notion internal links
  for (const match of content.matchAll(NOTION_LINK_RE)) {
    console.error(`✗ [${slug}] Notion internal link found: app.notion.com/blog/${match[1]}`)
    errors++
  }

  // Rule 2: all internal blog links must point to existing articles
  for (const match of content.matchAll(INTERNAL_LINK_RE)) {
    const linkedSlug = match[1]
    if (!existingSlugs.has(linkedSlug)) {
      console.error(`✗ [${slug}] Broken internal link: /articles/${linkedSlug}/ (article not found)`)
      errors++
    }
  }
}

if (errors === 0) {
  console.log(`✓ Link integrity check passed (${articles.length} articles)`)
} else {
  console.error(`\n${errors} error(s) found. Fix before deploying.`)
  process.exit(1)
}
