/**
 * One-off: copy the 3 blog posts that used to be hard-coded in the site into
 * Sanity, as published `post` documents.
 *
 *   SANITY_WRITE_TOKEN=<token with write access> npm run import-legacy              # dry run
 *   SANITY_WRITE_TOKEN=<token with write access> npm run import-legacy -- --commit   # write
 *
 * Safe to re-run: posts that already exist are skipped (so edits made in the
 * Studio are never overwritten) unless you pass --force.
 */
import {getCliClient} from 'sanity/cli'
import {BLOG_POSTS, type BlogPost, type BlogSection} from './legacy-posts'

const args = process.argv.slice(2)
const COMMIT = args.includes('--commit')
const FORCE = args.includes('--force')

// Tailwind classes in the old data → the colour names editors pick in the Studio.
const TAG_COLOR_FROM_CLASSES: Record<string, string> = {
  'bg-primary/10 text-primary border-primary/20': 'teal',
  'bg-amber-100 text-amber-700 border-amber-200': 'amber',
  'bg-rose-100 text-rose-700 border-rose-200': 'rose',
}

const docId = (slug: string) => `post-${slug}`

function textBlock(key: string, style: 'normal' | 'h2' | 'h3', text: string) {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{_type: 'span', _key: `${key}s`, text, marks: []}],
  }
}

function convertSection(section: BlogSection, i: number) {
  const k = `b${i}`
  const keyed = <T extends object>(type: string, items: T[] | undefined) =>
    (items ?? []).map((item, j) => ({_type: type, _key: `${k}i${j}`, ...item}))

  switch (section.type) {
    case 'paragraph':
      return textBlock(k, 'normal', section.text ?? '')
    case 'heading':
      return textBlock(k, 'h2', section.text ?? '')
    case 'subheading':
      return textBlock(k, 'h3', section.text ?? '')
    case 'ingredient-card':
    case 'ingredient-list':
      return {
        _type: 'ingredientCards',
        _key: k,
        layout: section.type === 'ingredient-list' ? 'grid' : 'stack',
        items: keyed('ingredientItem', section.items),
      }
    case 'tip-box':
    case 'warning-box':
      return {_type: 'callout', _key: k, tone: section.type === 'warning-box' ? 'warning' : 'tip', text: section.text ?? ''}
    case 'table':
      return {
        _type: 'dataTable',
        _key: k,
        headers: section.headers ?? [],
        rows: (section.rows ?? []).map((cells, j) => ({_type: 'tableRow', _key: `${k}r${j}`, cells})),
      }
    case 'product-picks':
      return {_type: 'productPicks', _key: k, products: keyed('productPick', section.products)}
    case 'checklist':
      return {_type: 'checklist', _key: k, items: keyed('checklistItem', section.checkItems)}
    default:
      throw new Error(`Unknown legacy section type: ${(section as {type: string}).type}`)
  }
}

function toDocument(post: BlogPost) {
  const minutes = parseInt(post.readingTime, 10)
  return {
    _id: docId(post.slug),
    _type: 'post',
    title: post.title,
    slug: {_type: 'slug', current: post.slug},
    excerpt: post.excerpt,
    coverEmoji: post.coverEmoji,
    body: post.content.map(convertSection),
    // Old dates were plain days; publish at 09:00 IST on that day.
    publishedAt: new Date(`${post.publishedAt}T09:00:00+05:30`).toISOString(),
    author: post.author,
    tag: post.tag,
    tagColor: TAG_COLOR_FROM_CLASSES[post.tagColor] ?? 'teal',
    readingTimeMinutes: Number.isFinite(minutes) ? minutes : undefined,
    relatedPosts: (post.relatedSlugs ?? []).map((slug, j) => ({
      _type: 'reference',
      _key: `rel${j}`,
      _ref: docId(slug),
    })),
  }
}

async function main() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (COMMIT && !token) throw new Error('Set SANITY_WRITE_TOKEN to a token with write access.')

  const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({token, useCdn: false})
  const {projectId, dataset} = client.config()
  const docs = BLOG_POSTS.map(toDocument)

  // Every related post must be part of this import, or the reference would dangle.
  const ids = new Set(docs.map((d) => d._id))
  for (const d of docs) for (const r of d.relatedPosts) if (!ids.has(r._ref)) throw new Error(`${d._id} references missing ${r._ref}`)

  const existing: string[] = token ? await client.fetch('*[_id in $ids]._id', {ids: [...ids]}) : []

  console.log(`${COMMIT ? 'Importing into' : 'Dry run for'} ${projectId}/${dataset}\n`)
  for (const d of docs) {
    const counts = d.body.reduce<Record<string, number>>((acc, b) => {
      const label = b._type === 'block' ? `block:${(b as {style: string}).style}` : b._type
      acc[label] = (acc[label] ?? 0) + 1
      return acc
    }, {})
    const status = existing.includes(d._id) ? (FORCE ? 'exists → replace' : 'exists → skip') : 'new'
    console.log(`• ${d._id} [${status}]\n  "${d.title}" · ${d.tag}/${d.tagColor} · ${d.publishedAt} · related: ${d.relatedPosts.map((r) => r._ref).join(', ') || '—'}`)
    console.log(`  ${Object.entries(counts).map(([t, n]) => `${t}×${n}`).join('  ')}\n`)
  }

  if (!COMMIT) {
    console.log('Nothing written. Re-run with --commit to import.')
    return
  }

  const toWrite = docs.filter((d) => FORCE || !existing.includes(d._id))
  if (toWrite.length === 0) {
    console.log('All posts already exist; nothing to import. Use --force to replace them.')
    return
  }
  const tx = client.transaction()
  for (const d of toWrite) {
    if (FORCE) tx.createOrReplace(d)
    else tx.createIfNotExists(d)
  }
  const res = await tx.commit({visibility: 'sync'})
  console.log(`Committed ${res.results.length} document(s) (transaction ${res.transactionId}).`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
