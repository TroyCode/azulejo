// Tiny helper to keep the original design's inline-style strings intact.
// Converts "display:flex; gap:10px" -> { display: 'flex', gap: '10px' } so the
// ported markup reads the same as the source design while satisfying React's
// requirement that `style` be an object. Results are memoised since most style
// strings are static literals.
const cache = new Map()

export function css(str) {
  if (!str) return undefined
  const cached = cache.get(str)
  if (cached) return cached
  const out = {}
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (!prop) continue
    const key = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[key] = val
  }
  cache.set(str, out)
  return out
}
