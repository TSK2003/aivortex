import fs from 'fs'
import path from 'path'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/appError.js'
import prisma from '../config/prisma.js'

// Allowed MIME types for streamed media
const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
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
 * Allows alphanumeric, hyphens, underscores, dots, spaces, and parentheses.
 */
function validateSegment(segment) {
  if (!segment || typeof segment !== 'string') return false
  if (segment.length > MAX_FILENAME_LENGTH) return false
  if (segment.includes('\0')) return false
  if (segment === '.' || segment === '..') return false
  if (segment.includes('..')) return false
  if (segment.includes('/') || segment.includes('\\')) return false
  // Allow alphanumeric, hyphens, underscores, dots, spaces, parentheses
  return /^[a-zA-Z0-9._\- ()]+$/.test(segment)
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
 * Helper to extract path segments from wildcard or params
 */
function extractSegments(req) {
  if (req.params[0]) {
    return req.params[0]
      .split('/')
      .filter(Boolean)
      .map((s) => {
        try {
          return decodeURIComponent(s)
        } catch {
          return s
        }
      })
  }

  const { folder, subFolder, fileName } = req.params
  return [folder, subFolder, fileName].filter(Boolean)
}

/**
 * Stream or download protected media files (videos, lesson resources).
 * Supports HTTP Range requests for video seeking and download flag for saving files.
 *
 * GET /api/media/stream/*
 * GET /api/media/download/*
 */
export async function streamProtectedMedia(req, res, next) {
  try {
    const segments = extractSegments(req)
    if (!segments.length) {
      throw new ForbiddenError('No media file specified.')
    }

    const filePath = resolveSecurePath(...segments)
    if (!filePath) {
      throw new ForbiddenError('Invalid media path requested.')
    }

    // Verify file exists on local storage
    try {
      await fs.promises.access(filePath, fs.constants.R_OK)
    } catch {
      throw new NotFoundError('Requested media asset not found on server.')
    }

    const fileName = path.basename(filePath)
    const ext = path.extname(fileName).toLowerCase()
    const contentType = MIME_TYPES[ext]
    if (!contentType) {
      throw new ForbiddenError('Unsupported media format.')
    }

    // Authorization & Defense-in-depth security check:
    // If the media is a course lesson video, ensure the student has access
    const isVideo = contentType.startsWith('video/')
    if (isVideo) {
      // Check if user is authenticated
      if (!req.user) {
        // Check if file is a public course demo or preview lesson
        const demoCourse = await prisma.course.findFirst({
          where: {
            OR: [
              { demoVideoUrl: { contains: fileName } },
              { thumbnail: { contains: fileName } }
            ]
          },
          select: { id: true }
        })

        const previewLesson = await prisma.lesson.findFirst({
          where: {
            OR: [
              { s3Key: { contains: fileName } },
              { videoUrl: { contains: fileName } }
            ],
            OR: [
              { isPreview: true },
              { isPublicDemo: true }
            ]
          },
          select: { id: true }
        })

        if (!demoCourse && !previewLesson) {
          throw new UnauthorizedError('Authentication required to access this course video.')
        }
      } else if (req.user.role === 'STUDENT') {
        // Enrolled student check: verify that non-preview lesson videos belong to an enrolled course
        const lesson = await prisma.lesson.findFirst({
          where: {
            OR: [
              { s3Key: { contains: fileName } },
              { videoUrl: { contains: fileName } }
            ]
          },
          include: {
            playlist: true
          }
        })

        if (lesson && !lesson.isPreview && !lesson.isPublicDemo) {
          const enrollment = await prisma.enrollment.findUnique({
            where: {
              studentId_courseId: {
                studentId: req.user.id,
                courseId: lesson.playlist.courseId
              }
            }
          })

          if (!enrollment || enrollment.status !== 'ACTIVE') {
            throw new ForbiddenError('Active course enrollment required to access this lecture video.')
          }
        }
      }
    }

    const stat = await fs.promises.stat(filePath)
    const fileSize = stat.size

    const isDownload = req.query.download === 'true' || req.query.download === '1' || req.path.includes('/download')
    const disposition = isDownload
      ? `attachment; filename="${encodeURIComponent(fileName)}"`
      : 'inline'

    // Support HTTP Range requests for video streaming (seeking support)
    const range = req.headers.range
    if (range && isVideo && !isDownload) {
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
        'Content-Disposition': disposition,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff'
      })

      stream.pipe(res)
      return
    }

    // Full file delivery (either complete playback or attachment download)
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Content-Disposition': disposition,
      'Accept-Ranges': 'bytes',
      'Cache-Control': isVideo ? 'private, no-store' : 'private, max-age=3600',
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
 * GET /api/media/public/thumbnails/*
 */
export async function streamPublicThumbnail(req, res, next) {
  try {
    const segments = extractSegments(req)
    if (!segments.length) {
      throw new ForbiddenError('No thumbnail specified.')
    }

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

/**
 * Admin/Creator: Delete media asset
 * DELETE /api/media/stream/*
 * DELETE /api/media/delete/*
 */
export async function deleteMediaAsset(req, res, next) {
  try {
    const segments = extractSegments(req)
    if (!segments.length) {
      return res.status(400).json({ success: false, error: 'No media file specified for deletion.' })
    }

    const filePath = resolveSecurePath(...segments)
    if (!filePath) {
      return res.status(403).json({ success: false, error: 'Invalid media path requested.' })
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
      return res.status(200).json({
        success: true,
        message: 'Media asset deleted successfully from storage.',
        deletedFile: path.basename(filePath)
      })
    } else {
      return res.status(404).json({
        success: false,
        error: 'Media file not found or already deleted.'
      })
    }
  } catch (err) {
    next(err)
  }
}
