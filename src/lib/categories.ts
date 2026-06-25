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

type CategoryMeta = {
  title: string
  h1: string
  description: string
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  'ai': {
    title: 'AI та штучний інтелект — Статті',
    h1: 'AI та штучний інтелект',
    description: 'Статті про штучний інтелект, AI-інструменти та автоматизацію в продуктовій розробці. Практичний досвід продуктового менеджера.',
  },
  'management': {
    title: 'Менеджмент та стратегія — Статті',
    h1: 'Менеджмент та стратегія',
    description: 'Статті про управління компаніями, стратегічне мислення та прийняття рішень для топ-менеджерів і власників бізнесу.',
  },
  'no-code': {
    title: 'Без розробників — Статті',
    h1: 'Без розробників',
    description: 'Як будувати цифрові продукти без залучення розробників — no-code інструменти, AI-асистенти та практичний досвід.',
  },
  'product-management': {
    title: 'Product Management — Статті',
    h1: 'Product Management',
    description: 'Продуктове управління: пріоритизація ініціатив, робота з метриками, процеси та побудова продуктових команд.',
  },
}

export function getCategoryMeta(slug: string): CategoryMeta {
  return CATEGORY_META[slug] ?? {
    title: 'Статті',
    h1: 'Статті',
    description: 'Статті Андрія Клименка про продукти, аналітику та технології.',
  }
}

export function getCategoryDescription(slug: string): string {
  return getCategoryMeta(slug).description
}
