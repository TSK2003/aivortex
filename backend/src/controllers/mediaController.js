import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

/**
 * Admin: Upload media asset (Course thumbnail, Course preview video, Project image, etc.)
 * POST /api/admin/media/upload
 */
export async function uploadAdminMedia(req, res) {
  try {
    const { imageBase64, videoBase64, mediaBase64, folder = 'courses', fileName } = req.body

    const rawData = mediaBase64 || videoBase64 || imageBase64
    if (!rawData || typeof rawData !== 'string') {
      return res.status(400).json({ success: false, error: 'No media data provided' })
    }

    // Determine mime & extension
    let mimeType = 'image/png'
    let extension = 'png'
    let base64Data = rawData

    if (rawData.includes(';base64,')) {
      const parts = rawData.split(';base64,')
      mimeType = parts[0].replace('data:', '').toLowerCase()
      base64Data = parts[1]

      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg'
      else if (mimeType.includes('png')) extension = 'png'
      else if (mimeType.includes('webp')) extension = 'webp'
      else if (mimeType.includes('svg')) extension = 'svg'
      else if (mimeType.includes('gif')) extension = 'gif'
      else if (mimeType.includes('mp4')) extension = 'mp4'
      else if (mimeType.includes('webm')) extension = 'webm'
      else if (mimeType.includes('ogg')) extension = 'ogv'
    } else if (fileName) {
      const ext = path.extname(fileName).replace('.', '').toLowerCase()
      if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'mp4', 'webm', 'ogg'].includes(ext)) {
        extension = ext === 'jpeg' ? 'jpg' : ext
        if (ext === 'mp4') mimeType = 'video/mp4'
        else if (ext === 'webm') mimeType = 'video/webm'
      }
    }

    const isVideo = mimeType.startsWith('video/') || ['mp4', 'webm', 'ogv'].includes(extension)
    const isImage = mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(extension)

    if (!isVideo && !isImage) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported media format. Please upload MP4 or WebM for videos, or PNG, JPG, or WebP for images.'
      })
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general'
    const targetDir = path.join(process.cwd(), 'uploads', safeFolder)
    await fs.promises.mkdir(targetDir, { recursive: true })

    const uniqueName = `${Date.now()}-${uuidv4().slice(0, 8)}.${extension}`
    const targetFilePath = path.join(targetDir, uniqueName)

    const buffer = Buffer.from(base64Data, 'base64')

    // File size validation (max 60MB for videos, 10MB for images)
    const maxSizeBytes = isVideo ? 60 * 1024 * 1024 : 10 * 1024 * 1024
    if (buffer.length > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds the limit of ${isVideo ? '60MB' : '10MB'}.`
      })
    }

    await fs.promises.writeFile(targetFilePath, buffer)

    const relativeUrl = `/api/media/stream/${safeFolder}/${uniqueName}`

    return res.status(201).json({
      success: true,
      message: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
      data: {
        url: relativeUrl,
        fileName: uniqueName,
        mimeType,
        sizeBytes: buffer.length
      }
    })
  } catch (error) {
    console.error('uploadAdminMedia error:', error)
    return res.status(500).json({ success: false, error: 'Failed to upload media: ' + error.message })
  }
}
