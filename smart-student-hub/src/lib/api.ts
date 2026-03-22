/**
 * Base URL for the Express API. Set NEXT_PUBLIC_API_URL on Vercel to your Render service URL (no trailing slash).
 */
export function apiUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
