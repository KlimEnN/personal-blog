const UA_MAP: Record<string, string> = {
  а:'a', б:'b', в:'v', г:'h', ґ:'g', д:'d', е:'e', є:'ye',
  ж:'zh', з:'z', и:'y', і:'i', ї:'yi', й:'y', к:'k', л:'l',
  м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u',
  ф:'f', х:'kh', ц:'ts', ч:'ch', ш:'sh', щ:'shch', ь:'',
  ю:'yu', я:'ya',
}

export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .split('')
    .map(ch => UA_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type CategoryEntry = { slug: string; label: string }

export function getCategorySlug(article: { category: string | null; categorySlug: string | null }): string | null {
  if (!article.category) return null
  return article.categorySlug ?? slugifyCategory(article.category)
}

export function getCategories(articles: Array<{ category: string | null; categorySlug: string | null }>): CategoryEntry[] {
  const map = new Map<string, string>()
  for (const a of articles) {
    if (!a.category) continue
    const slug = getCategorySlug(a)!
    if (!map.has(slug)) map.set(slug, a.category)
  }
  return [...map.entries()].map(([slug, label]) => ({ slug, label }))
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'ai': 'Статті про штучний інтелект, AI-інструменти та автоматизацію в продуктовій розробці.',
  'menedzhment': 'Статті про управління, стратегію та прийняття рішень для топ-менеджерів.',
  'bez-rozrobnykiv': 'Як будувати цифрові продукти без залучення розробників — інструменти, підходи, досвід.',
  'product-management': 'Продуктове управління: пріоритизація, метрики, процеси та побудова команд.',
}

export function getCategoryDescription(slug: string): string {
  return CATEGORY_DESCRIPTIONS[slug] ?? `Статті в категорії.`
}
