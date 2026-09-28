import nodemailer from 'nodemailer'

const checkIsConfigured = () => !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  !process.env.SMTP_USER.includes('mock')
)

let transporter = null

const getTransporter = () => {
  if (!checkIsConfigured()) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  }
  return transporter
}

const getAppBaseUrl = () => {
  return process.env.APP_PUBLIC_URL || process.env.CLIENT_URL || 'http://13.201.19.85'
}

export const emailService = {
  isConfigured: () => checkIsConfigured(),

  verifyConnection: async () => {
    const client = getTransporter()
    if (!client) throw new Error('SMTP is not configured')
    return await client.verify()
  },

  /**
   * General email sending function.
   */
  sendMail: async ({ to, subject, html, text }) => {
    const from = process.env.SMTP_FROM || `ApexLearn <${process.env.SMTP_USER || 'no-reply@apexlearn.edu'}>`
    const client = getTransporter()

    if (!checkIsConfigured() || !client) {
      console.log(`\n📧 [Mock Email Dispatch]`)
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`HTML Body Preview: ${html.slice(0, 180)}...\n`)
      return { messageId: `mock-msg-${Date.now()}`, accepted: [to] }
    }

    try {
      const info = await client.sendMail({ from, to, subject, html, text })
      console.log(`✅ [Email Dispatched] To: ${to} | ID: ${info.messageId}`)
      return info
    } catch (err) {
      console.error(`❌ [Email Dispatch Failed] To: ${to}:`, err.message)
      throw err
    }
  },

  /**
   * Creator Welcome & Account Invitation Email Template
   */
  sendCreatorInvitation: async ({ name, email, tempPassword, setupUrl }) => {
    const baseUrl = getAppBaseUrl()
    const subject = 'Welcome to ApexLearn Creator Studio — Your Account is Ready'
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0F172A;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563EB; margin: 0;">ApexLearn Institute</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">CREATOR STUDIO INVITATION</p>
        </div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>You have been officially provisioned as an authorized Curriculum Creator on the ApexLearn technical learning platform.</p>
          <div style="background: #EFF6FF; border-left: 4px solid #2563EB; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Your Temporary Credentials:</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 14px;">Email: <code>${email}</code></p>
            <p style="margin: 4px 0 0 0; font-size: 14px;">Temporary Password: <code>${tempPassword || 'creatorTempPassword2026!'}</code></p>
          </div>
          <p>Please log in to your Creator Portal to build playlists, upload lecture modules, and submit content for review:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${setupUrl || `${baseUrl}/creator/login`}" style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Enter Creator Studio
            </a>
          </div>
          <p style="font-size: 12px; color: #94A3B8;">If you did not expect this invitation, please contact administrator at director@apexlearn.edu.</p>
        </div>
      </div>
    `
    return await emailService.sendMail({ to: email, subject, html })
  },

  /**
   * Student Enrollment & Payment Confirmation Email Template
   */
  sendPaymentConfirmation: async ({ studentName, email, courseTitle, orderId, amount }) => {
    const baseUrl = getAppBaseUrl()
    const subject = `Payment Confirmed — Enrolled in ${courseTitle}`
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0F172A;">
        <h2 style="color: #16A34A; text-align: center;">Payment Successful!</h2>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Thank you for enrolling in <strong>${courseTitle}</strong>. Your payment has been verified and processed securely via Razorpay.</p>
          <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #64748B;">Order Reference: <strong>${orderId}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #64748B;">Amount Paid: <strong style="color: #0F172A; font-size: 16px;">₹${amount}</strong></p>
            <p style="margin: 0; font-size: 13px; color: #16A34A; font-weight: bold;">Status: Complete & Active</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${baseUrl}/student/courses" style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Start Learning Now
            </a>
          </div>
        </div>
      </div>
    `
    return await emailService.sendMail({ to: email, subject, html })
  },

  /**
   * Password Reset Email Template
   */
  sendPasswordResetEmail: async ({ toEmail, name, token }) => {
    const baseUrl = getAppBaseUrl()
    const resetUrl = `${baseUrl}/portal?resetToken=${token}`
    const subject = 'Password Reset Request — ApexLearn'
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0F172A;">
        <h2 style="color: #2563EB; text-align: center;">Password Reset Request</h2>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
          <p>Hello <strong>${name || 'Student'}</strong>,</p>
          <p>We received a request to reset your password for your ApexLearn account.</p>
          <p>Click the button below to choose a new password. This link is cryptographically protected and expires in 1 hour:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 12px; color: #64748B;">If you did not request this password reset, please ignore this email. Your current password will remain unchanged.</p>
        </div>
      </div>
    `
    return await emailService.sendMail({ to: toEmail, subject, html })
  },

  /**
   * Video Review Feedback Email Template to Creator
   */
  sendVideoReviewFeedback: async ({ creatorName, email, videoTitle, status, feedbackNote }) => {
    const isApproved = status === 'APPROVED'
    const subject = `Video Review Update: ${videoTitle} — ${status}`
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h3>Video Review Status Update</h3>
        <p>Hello <strong>${creatorName}</strong>,</p>
        <p>Your submitted lecture video <strong>${videoTitle}</strong> has been reviewed by the Platform Director.</p>
        <div style="padding: 16px; border-radius: 6px; background: ${isApproved ? '#DCFCE7' : '#FEF3C7'}; margin: 16px 0;">
          <strong>Review Decision: ${status}</strong>
          ${feedbackNote ? `<p style="margin-top: 8px;"><strong>Feedback:</strong> ${feedbackNote}</p>` : ''}
        </div>
      </div>
    `
    return await emailService.sendMail({ to: email, subject, html })
  }
}

export default emailService
