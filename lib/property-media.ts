export type PropertyMediaLike = {
  url: string
  isPrimary?: boolean | null
  isBanner?: boolean | null
  order?: number | null
}

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|mov|m4v|avi|mkv)(?:[?#].*)?$/i

export function isVideoUrl(url: string) {
  const lower = url.toLowerCase()
  return lower.includes("/video/upload/") || VIDEO_EXTENSION_PATTERN.test(lower)
}

export function isImageUrl(url: string) {
  return !isVideoUrl(url)
}

export function getImageMedia<T extends PropertyMediaLike>(media: T[] | null | undefined) {
  return (media ?? []).filter((item) => isImageUrl(item.url))
}

export function getPrimaryImageUrl(media: PropertyMediaLike[] | null | undefined) {
  const images = getImageMedia(media)
  return images.find((item) => item.isPrimary)?.url ?? images[0]?.url ?? null
}

export function getBannerImageUrl(media: PropertyMediaLike[] | null | undefined) {
  const images = getImageMedia(media)
  return (
    images.find((item) => item.isBanner)?.url ??
    images.find((item) => item.isPrimary)?.url ??
    images[0]?.url ??
    null
  )
}

export function getCloudinaryResourceType(url: string): "image" | "video" {
  return isVideoUrl(url) ? "video" : "image"
}

// Rewrite a Cloudinary video URL to deliver a compressed, web-optimized stream:
//  - f_auto: best codec/container for the viewer's browser
//  - q_auto: automatic quality (large bandwidth savings, near-lossless)
//  - c_limit,w_1920: downscale anything above 1080p (never upscales)
// Non-Cloudinary URLs (e.g. pasted external links) are returned unchanged.
export function getOptimizedVideoUrl(url: string): string {
  const marker = "/video/upload/"
  const idx = url.indexOf(marker)
  if (idx === -1) return url

  const after = url.slice(idx + marker.length)
  // If a transformation segment is already present, don't double-apply.
  if (/^[^/]*(?:f_auto|q_auto|c_limit|w_\d)/.test(after)) return url

  const transform = "f_auto,q_auto,c_limit,w_1920/"
  return url.slice(0, idx + marker.length) + transform + after
}

// Cloudinary can also generate a still poster from the video's first frame,
// so the player shows a compressed preview instead of loading the whole file.
export function getVideoPosterUrl(url: string): string | null {
  const marker = "/video/upload/"
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const after = url.slice(idx + marker.length).replace(/\.(mp4|webm|mov|m4v|avi|mkv)(?:[?#].*)?$/i, ".jpg")
  return url.slice(0, idx + marker.length) + "f_auto,q_auto,so_0/" + after
}
