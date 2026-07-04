import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually (no dotenv dependency needed)
const envPath = join(__dirname, '../.env')
try {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
} catch {}

const require = createRequire(import.meta.url)
const { Client } = require('@notionhq/client')

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const BASE_URL = 'https://klymenko.space'

// Page IDs from local articles.json cache
const PAGES = {
  'leadership-as-a-service': '38b2745d-0b71-818e-9d49-f128b8acb879',
  'ambitions-without-resources-part-1': '38a2745d-0b71-81e7-ba26-e8c3c853133e',
  'claude-code-codex-audit-blog': '3862745d-0b71-81a0-a85b-c9fd74e2fdab',
  'artwork-image-module-met-museum-api': '3862745d-0b71-8181-a997-c277e803233c',
  'yak-ya-stvoryv-tsei-bloh-za-dopomohoyu-claude-code': '3862745d-0b71-80ae-a187-d94265afa0f1',
  'prioritize-initiatives-key-metrics': '3862745d-0b71-8012-8fad-ec3ccb1ef97c',
}

// SEO TZ linking map: each article → natural concluding paragraph with links
const LINKING_PLAN = [
  {
    slug: 'leadership-as-a-service',
    paragraph: [
      { text: 'Якщо вас цікавить, як команди потрапляють у пастку без чіткого розуміння пріоритетів, читайте також ' },
      {
        text: 'Амбіції без ресурсів: пастка, яку будують самі',
        url: `${BASE_URL}/articles/ambitions-without-resources-part-1/`,
      },
      { text: ' — це дві сторони однієї медалі лідерства.' },
    ],
  },
  {
    slug: 'ambitions-without-resources-part-1',
    paragraph: [
      { text: "Пов’язані теми в блозі: " },
      {
        text: 'Лідерство як сервіс: чому контроль вбиває команду',
        url: `${BASE_URL}/articles/leadership-as-a-service/`,
      },
      { text: ' — про те, як стиль управління впливає на ефективність команди, та ' },
      {
        text: 'Пріоритизація ініціатив через вплив на метрики',
        url: `${BASE_URL}/articles/prioritize-initiatives-key-metrics/`,
      },
      { text: ' — про системний підхід до вибору задач.' },
    ],
  },
  {
    slug: 'prioritize-initiatives-key-metrics',
    paragraph: [
      { text: 'Якщо хочете розібратися, чому команди беруться за все одразу і ні на що не вистачає ресурсів — читайте ' },
      {
        text: 'Амбіції без ресурсів: пастка, яку будують самі',
        url: `${BASE_URL}/articles/ambitions-without-resources-part-1/`,
      },
      { text: '.' },
    ],
  },
  {
    slug: 'claude-code-codex-audit-blog',
    paragraph: [
      { text: 'Якщо вам цікаво, як цей блог будувався з нуля без написання коду вручну, читайте ' },
      {
        text: 'Як PM без коду побудував блог на Astro за допомогою Claude',
        url: `${BASE_URL}/articles/yak-ya-stvoryv-tsei-bloh-za-dopomohoyu-claude-code/`,
      },
      { text: ' — повна історія від ідеї до деплою.' },
    ],
  },
  {
    slug: 'artwork-image-module-met-museum-api',
    paragraph: [
      { text: 'Цей модуль — одна з багатьох деталей, які виявились під час аудиту. Про весь процес оцінки та покращення блогу читайте у статті ' },
      {
        text: 'Як Claude Code і Codex підняли якість блогу з 7.5 до 9.5',
        url: `${BASE_URL}/articles/claude-code-codex-audit-blog/`,
      },
      { text: '.' },
    ],
  },
]

function buildRichText(parts) {
  return parts.map(part => ({
    type: 'text',
    text: {
      content: part.text,
      link: part.url ? { url: part.url } : null,
    },
  }))
}

async function addLinkParagraph(slug, parts) {
  const pageId = PAGES[slug]
  if (!pageId) {
    console.error(`No page ID for slug: ${slug}`)
    return
  }

  const richText = buildRichText(parts)

  try {
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: richText,
            color: 'default',
          },
        },
      ],
    })
    console.log(`✓ ${slug}`)
  } catch (err) {
    console.error(`✗ ${slug}: ${err.message}`)
  }
}

async function main() {
  console.log('Adding internal links to articles...\n')

  for (const { slug, paragraph } of LINKING_PLAN) {
    await addLinkParagraph(slug, paragraph)
    await new Promise(r => setTimeout(r, 400))
  }

  console.log('\nDone.')
}

main()
