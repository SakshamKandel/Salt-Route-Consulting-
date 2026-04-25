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
