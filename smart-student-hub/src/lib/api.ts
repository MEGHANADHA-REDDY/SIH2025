/**
 * Base URL for the Express API. Set NEXT_PUBLIC_API_URL in production (no trailing slash).
 */
export function apiUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

/**
 * Absolute URL for files served by the API (e.g. /uploads/...). Leaves http(s) URLs unchanged.
 */
export function apiAssetUrl(path: string | null | undefined): string {
  if (path == null || path === '') return ''
  const trimmed = String(path).trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return apiUrl(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
}
