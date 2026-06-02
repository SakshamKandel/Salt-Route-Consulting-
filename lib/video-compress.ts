"use client"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

// Pinned multi-threaded core (needs cross-origin isolation — see next.config headers).
const CORE_BASE = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/umd"

let ffmpegSingleton: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

export function canCompressVideo(): boolean {
  // ffmpeg.wasm (mt core) requires SharedArrayBuffer, which is only available on
  // cross-origin-isolated pages and in browsers that support it.
  return typeof window !== "undefined" && window.crossOriginIsolated === true
}

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.worker.js`, "text/javascript"),
    })
    ffmpegSingleton = ffmpeg
    return ffmpeg
  })()

  return loadPromise
}

/**
 * Compress/downscale a video in the browser to H.264 1080p (CRF 28) with faststart.
 * Returns the original file unchanged if compression is unavailable or fails, or if
 * the result is not actually smaller. `onProgress` reports 0..1.
 */
export async function compressVideo(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<File> {
  if (!canCompressVideo()) {
    throw new Error("not-supported")
  }

  const ffmpeg = await getFFmpeg()

  const onProg = ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.max(0, Math.min(1, progress)))
  }
  ffmpeg.on("progress", onProg)

  const inputName = "input"
  const outputName = "compressed.mp4"

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file))
    await ffmpeg.exec([
      "-i", inputName,
      // Cap width at 1920, keep aspect ratio, force even height.
      "-vf", "scale='min(1920,iw)':-2",
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "veryfast",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputName,
    ])

    const data = await ffmpeg.readFile(outputName)
    // Copy into a plain ArrayBuffer-backed Uint8Array (the mt core may return a
    // SharedArrayBuffer-backed view, which is not a valid BlobPart).
    const src = data as Uint8Array
    const bytes = new Uint8Array(src.byteLength)
    bytes.set(src)
    const blob = new Blob([bytes], { type: "video/mp4" })

    // Clean up the virtual FS so repeated uploads don't accumulate.
    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile(outputName).catch(() => {})

    // Only use the compressed version if it actually shrank the file.
    if (blob.size === 0 || blob.size >= file.size) {
      return file
    }

    const newName = file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4"
    return new File([blob], newName, { type: "video/mp4" })
  } finally {
    ffmpeg.off("progress", onProg)
  }
}
