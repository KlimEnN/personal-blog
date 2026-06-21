import { createWriteStream, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const IMAGES_DIR = join(ROOT, 'public', 'images', 'articles')

const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1'

// Curated list of Met Museum artwork IDs — famous, high-quality, varied styles
const ARTWORK_IDS = [
  436535,  // Vincent van Gogh — Wheat Field with Cypresses
  437984,  // Vincent van Gogh — Self-Portrait with a Straw Hat
  438722,  // Georges Seurat — A Sunday on La Grande Jatte (study)
  435882,  // Claude Monet — Bridge over a Pond of Water Lilies
  437329,  // Paul Cézanne — The Card Players
  436121,  // Paul Gauguin — Ia Orana Maria
  438014,  // Henri Rousseau — The Repast of the Lion
  436528,  // Vincent van Gogh — Shoes
  435900,  // Claude Monet — Haystacks
  437394,  // Édouard Manet — The Spanish Singer
  436947,  // Camille Pissarro — The Boulevard Montmartre on a Winter Morning
  435776,  // Edgar Degas — The Dancing Class
  436105,  // Mary Cassatt — Mother and Child
  436524,  // Vincent van Gogh — L'Arlésienne
  437654,  // Gustave Courbet — Young Ladies from the Village
  435769,  // Edgar Degas — At the Milliner's
  436536,  // Vincent van Gogh — Oleanders
  435875,  // Claude Monet — Chrysanthemums
  437113,  // Pierre-Auguste Renoir — A Girl with a Watering Can
  436533,  // Vincent van Gogh — The Flowering Orchard
  459123,  // Jan Vermeer — Study of a Young Woman
  437246,  // Frans Hals — Young Man and Woman in an Inn
  436122,  // Paul Gauguin — Two Tahitian Women
  436533,  // Vincent van Gogh — The Flowering Orchard
  435817,  // Claude Monet — Garden at Sainte-Adresse
  484935,  // Rembrandt — Self-Portrait
  436955,  // Camille Pissarro — Jalais Hill, Pontoise
  437329,  // Paul Cézanne — The Card Players
  437980,  // Vincent van Gogh — Sunflowers
  435868,  // Claude Monet — Women in the Garden
]

// Deterministic index from slug
function slugToIndex(slug) {
  let hash = 0
  for (const ch of slug) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  }
  return hash % ARTWORK_IDS.length
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

async function downloadImage(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download image: ${url}`)
  await pipeline(res.body, createWriteStream(destPath))
}

const BLOCKED_NATIONALITIES = [
  'Russian', 'Soviet', 'USSR', 'U.S.S.R.', 'Imperial Russian',
]

const BLOCKED_CULTURES = [
  'Russian', 'Soviet', 'USSR',
]

function isBlocked(data) {
  const nationality = data.artistNationality ?? ''
  const culture = data.culture ?? ''
  const country = data.country ?? ''

  const check = (val) => BLOCKED_NATIONALITIES.some(k => val.includes(k))
  const checkCulture = (val) => BLOCKED_CULTURES.some(k => val.includes(k))

  return check(nationality) || checkCulture(culture) || check(country)
}

async function getArtwork(id) {
  const data = await fetchJson(`${MET_API}/objects/${id}`)
  if (!data.primaryImage) throw new Error(`No image for artwork ${id}`)
  if (isBlocked(data)) throw new Error(`Blocked artwork ${id}: ${data.artistNationality || data.culture}`)
  return {
    imageUrl: data.primaryImage,
    alt: [data.title, data.artistDisplayName, data.objectDate]
      .filter(Boolean)
      .join(', '),
    credit: data.creditLine || 'The Metropolitan Museum of Art',
  }
}

async function processImage(sourcePath, destPath, width, height) {
  await sharp(sourcePath)
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toFile(destPath)
}

export async function fetchArticleImage(slug) {
  const dir = join(IMAGES_DIR, slug)
  const cardPath = join(dir, 'card.webp')
  const ogPath = join(dir, 'og.webp')
  const metaPath = join(dir, 'meta.json')

  // Skip if already processed — return full metadata from cache
  if (existsSync(cardPath) && existsSync(ogPath) && existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
    return {
      card: `/images/articles/${slug}/card.webp`,
      og: `/images/articles/${slug}/og.webp`,
      alt: meta.alt,
      credit: meta.credit,
    }
  }

  const artworkId = ARTWORK_IDS[slugToIndex(slug)]
  let artwork

  // Try current ID, fallback to next few if no image
  for (let i = 0; i < 5; i++) {
    const id = ARTWORK_IDS[(slugToIndex(slug) + i) % ARTWORK_IDS.length]
    try {
      artwork = await getArtwork(id)
      break
    } catch {
      continue
    }
  }

  if (!artwork) throw new Error(`Could not find artwork for slug: ${slug}`)

  mkdirSync(dir, { recursive: true })

  const tmpPath = join(dir, '_original.tmp')
  await downloadImage(artwork.imageUrl, tmpPath)
  await processImage(tmpPath, cardPath, 800, 480)
  await processImage(tmpPath, ogPath, 1200, 630)

  // Remove temp file
  const { unlinkSync } = await import('fs')
  try { unlinkSync(tmpPath) } catch {}

  // Save metadata so repeated builds don't lose alt/credit
  writeFileSync(metaPath, JSON.stringify({ alt: artwork.alt, credit: artwork.credit }, null, 2))

  return {
    card: `/images/articles/${slug}/card.webp`,
    og: `/images/articles/${slug}/og.webp`,
    alt: artwork.alt,
    credit: artwork.credit,
  }
}
