export function toRelativeUrl(absoluteUrl) {
  if (!absoluteUrl) return absoluteUrl
  try {
    const url = new URL(absoluteUrl, window.location.origin)
    return `${url.pathname}${url.search}`
  } catch {
    return absoluteUrl
  }
}