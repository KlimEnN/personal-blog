import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataFile = join(__dirname, '../src/data/articles.json')

if (!existsSync(dataFile)) {
  console.log('articles.json not found — fetching from Notion...')
  execSync('node scripts/fetch-notion.mjs', { stdio: 'inherit', cwd: join(__dirname, '..') })
} else {
  console.log('articles.json found, skipping fetch.')
}
