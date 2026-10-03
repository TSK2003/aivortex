import fs from 'fs'
import path from 'path'
import { ForbiddenError, NotFoundError } from '../utils/appError.js'

// Allowed MIME types for streamed media
const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf'
}

// Maximum allowed filename length to prevent path traversal
const MAX_FILENAME_LENGTH = 255

/**
 * Validates a filename segment against path traversal and directory escape attacks.
 * Rejects null bytes, directory traversal sequences, and non-whitelisted characters.
 */
function validateSegment(segment) {
  if (!segment || typeof segment !== 'string') return false
  if (segment.length > MAX_FILENAME_LENGTH) return false
  if (segment.includes('\0')) return false
  if (segment === '.' || segment === '..') return false
  if (segment.includes('..')) return false
  if (segment.includes('/') || segment.includes('\\')) return false
  // Allow alphanumeric, hyphens, underscores, dots (for extensions)
  return /^[a-zA-Z0-9._-]+$/.test(segment)
}

/**
 * Resolves a safe absolute file path from URL segments.
 * Returns null if any segment is invalid or the resolved path escapes the uploads directory.
 */
function resolveSecurePath(...segments) {
  for (const seg of segments) {
    if (!validateSegment(seg)) return null
  }

  const uploadsRoot = path.resolve(process.cwd(), 'uploads')
  const resolved = path.resolve(uploadsRoot, ...segments)

  // Ensure the resolved path is strictly within the uploads directory (jail)
  if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
    return null
  }

  return resolved
}

/**
 * Stream protected media files (videos, lesson resources).
 * Requires authenticated user. Supports HTTP Range requests for video seeking.
 *
 * GET /api/media/stream/:folder/:subFolder/:fileName
 * GET /api/media/stream/:folder/:fileName
 */
export async function streamProtectedMedia(req, res, next) {
  try {
    const { folder, subFolder, fileName } = req.params

    // Build path segments based on route pattern
    const segments = subFolder
      ? [folder, subFolder, fileName]
      : [folder, fileName]

    const filePath = resolveSecurePath(...segments)
    if (!filePath) {
      throw new ForbiddenError('Invalid media path requested.')
    }

    // Verify file exists
    try {
      await fs.promises.access(filePath, fs.constants.R_OK)
    } catch {
      throw new NotFoundError('Requested media asset not found.')
    }

    const ext = path.extname(fileName).toLowerCase()
    const contentType = MIME_TYPES[ext]
    if (!contentType) {
      throw new ForbiddenError('Unsupported media format.')
    }

    const stat = await fs.promises.stat(filePath)
    const fileSize = stat.size

    // Support HTTP Range requests for video streaming (seek support)
    const range = req.headers.range
    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end()
        return
      }

      const chunkSize = end - start + 1
      const stream = fs.createReadStream(filePath, { start, end })

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff'
      })

      stream.pipe(res)
      return
    }

    // Full file delivery for non-range requests
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': contentType.startsWith('video/') ? 'private, no-store' : 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    })

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  } catch (err) {
    next(err)
  }
}

/**
 * Stream public thumbnail images (course thumbnails, preview images).
 * No authentication required -- these are displayed on the public catalog.
 *
 * GET /api/media/public/thumbnails/:folder/:fileName
 * GET /api/media/public/thumbnails/:fileName
 */
export async function streamPublicThumbnail(req, res, next) {
  try {
    const { folder, fileName } = req.params

    const segments = folder && fileName
      ? [folder, fileName]
      : [folder || fileName]

    const filePath = resolveSecurePath(...segments)
    if (!filePath) {
      throw new ForbiddenError('Invalid thumbnail path requested.')
    }

    const ext = path.extname(segments[segments.length - 1]).toLowerCase()

    // Only allow image types for public thumbnails (no video or PDF)
    const imageTypes = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
    if (!imageTypes.includes(ext)) {
      throw new ForbiddenError('Only image thumbnails are publicly accessible.')
    }

    try {
      await fs.promises.access(filePath, fs.constants.R_OK)
    } catch {
      throw new NotFoundError('Requested thumbnail not found.')
    }

    const contentType = MIME_TYPES[ext]
    const stat = await fs.promises.stat(filePath)

    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff'
    })

    fs.createReadStream(filePath).pipe(res)
  } catch (err) {
    next(err)
  }
}
