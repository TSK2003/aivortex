import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const isConfigured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET &&
  !process.env.AWS_ACCESS_KEY_ID.includes('mock')
)

let s3Client = null

if (isConfigured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'apexlearn-course-assets'

export const s3Service = {
  isConfigured: () => isConfigured,

  /**
   * Generates a pre-signed URL for direct browser-to-S3 video/resource upload.
   */
  getPresignedUploadUrl: async (key, contentType = 'video/mp4', expiresIn = 3600) => {
    if (!isConfigured || !s3Client) {
      console.warn('⚠️ S3 not configured with live credentials; returning local backend upload endpoint.')
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`
      return {
        uploadUrl: `${baseUrl}/api/creator/videos/upload-local?key=${encodeURIComponent(key)}`,
        key,
        bucket: 'local-storage'
      }
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return { uploadUrl, key, bucket: BUCKET_NAME }
  },

  /**
   * Generates a time-limited pre-signed URL for authorized video streaming and resource download.
   */
  getPresignedDownloadUrl: async (key, expiresIn = 7200) => {
    if (!isConfigured || !s3Client) {
      if (key && (key.startsWith('uploads/') || key.startsWith('/uploads/'))) {
        const cleanKey = key.replace(/^[/\\]+/, '')
        const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`
        return `${baseUrl}/${cleanKey}`
      }
      // Return safe sample video streaming URL for development and testing
      return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?mockSigned=true&exp=${Date.now() + expiresIn * 1000}`
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  },

  /**
   * Deletes an object from S3.
   */
  deleteObject: async (key) => {
    if (!isConfigured || !s3Client) {
      console.log(`[MockS3] Delete object request for key: ${key}`)
      return true
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    await s3Client.send(command)
    return true
  }
}

export default s3Service
