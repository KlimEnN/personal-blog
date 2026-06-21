/**
 * Generates a default OG image for the homepage (public/og-default.webp)
 * Run once: node scripts/generate-og.mjs
 */
import { createRequire } from 'module'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sharp = createRequire(import.meta.url)('sharp')

const OUT = join(__dirname, '../public/og-default.webp')

if (existsSync(OUT)) {
  console.log('og-default.webp already exists, skipping.')
  process.exit(0)
}

// 1200x630 gradient background with initials
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FAFAF8"/>
      <stop offset="100%" style="stop-color:#e8e6ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="600" cy="240" r="80" fill="#6457F8"/>
  <text x="600" y="260" font-family="system-ui, sans-serif" font-size="56" font-weight="700"
    fill="white" text-anchor="middle" dominant-baseline="middle">АК</text>
  <text x="600" y="380" font-family="system-ui, sans-serif" font-size="42" font-weight="800"
    fill="#1A1A1C" text-anchor="middle">Андрій Клименко</text>
  <text x="600" y="445" font-family="system-ui, sans-serif" font-size="24" font-weight="400"
    fill="#6A6A6F" text-anchor="middle">Продуктовий менеджер · blog.klymenko.space</text>
</svg>`

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 85 })
  .toFile(OUT)

console.log('Generated og-default.webp')
