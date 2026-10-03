import nodemailer from 'nodemailer'
import dns from 'dns'
import net from 'net'
import dotenv from 'dotenv'

const checkIsConfigured = () => {
  dotenv.config()
  return !!(
    (process.env.SMTP_HOST || process.env.SMTP_SERVICE) &&
    process.env.SMTP_USER &&
    !process.env.SMTP_USER.includes('mock') &&
    process.env.SMTP_USER !== 'mock_smtp_user'
  )
}

let transporter = null
let cachedUser = null
let cachedPass = null
let cachedHost = null
let cachedPort = null

const getTransporter = () => {
  dotenv.config()
  if (!checkIsConfigured()) return null

  const currentUser = process.env.SMTP_USER
  const currentPass = process.env.SMTP_PASS
  const currentHost = process.env.SMTP_HOST
  const currentPort = process.env.SMTP_PORT

  if (!transporter || cachedUser !== currentUser || cachedPass !== currentPass || cachedHost !== currentHost || cachedPort !== currentPort) {
    cachedUser = currentUser
    cachedPass = currentPass
    cachedHost = currentHost
    cachedPort = currentPort

    const isGmail = process.env.SMTP_HOST === 'smtp.gmail.com' || process.env.SMTP_SERVICE === 'gmail'
    const port = parseInt(process.env.SMTP_PORT, 10) || (isGmail ? 465 : 587)
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465

    const transportOpts = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      : {
          host: process.env.SMTP_HOST,
          port,
          secure: isSecure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000
        }

    transporter = nodemailer.createTransport(transportOpts)
  }
  return transporter
}

const getAppBaseUrl = () => {
  return process.env.APP_PUBLIC_URL || process.env.CLIENT_URL || 'http://13.201.19.85'
}

/**
 * Probes the target mail exchange server on port 25 to verify that the specific recipient mailbox exists.
 * If the mail server rejects the address (e.g. 550 NoSuchUser), returns { deliverable: false, code, reason }.
 * If the mail server accepts or doesn't reject (or connection/ISP times out), returns { deliverable: true }.
 */
function checkSmtpRecipient(email, primaryMx) {
  return new Promise((resolve) => {
    let resolved = false
    const socket = net.createConnection(25, primaryMx)
    socket.setTimeout(5000)
    let step = 0
    let buffer = ''

    const finish = (result) => {
      if (resolved) return
      resolved = true
      try { socket.write('QUIT\r\n') } catch (_) {}
      try { socket.destroy() } catch (_) {}
      resolve(result)
    }

    socket.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split('\r\n')
      const lastLine = lines.filter(Boolean).pop()
      if (!lastLine) return
      // Multi-line SMTP response continuation (e.g. '250-...')
      if (lastLine.length >= 4 && lastLine[3] === '-') return

      const code = parseInt(lastLine.slice(0, 3), 10)
      buffer = ''

      if (step === 0 && (code === 220 || code === 200)) {
        step = 1
        socket.write('EHLO mail.aivortex.com\r\n')
      } else if (step === 1 && code === 250) {
        step = 2
        socket.write('MAIL FROM:<verify@aivortex.com>\r\n')
      } else if (step === 2 && code === 250) {
        step = 3
        socket.write(`RCPT TO:<${email}>\r\n`)
      } else if (step === 3) {
        const lowerLine = lastLine.toLowerCase()
        const isRejection = (
          (code >= 550 && code <= 554) ||
          code === 501 ||
          code === 503 ||
          lowerLine.includes('does not exist') ||
          lowerLine.includes('user not found') ||
          lowerLine.includes('nosuchuser') ||
          lowerLine.includes('mailbox unavailable') ||
          lowerLine.includes('invalid recipient') ||
          lowerLine.includes('user unknown') ||
          lowerLine.includes('recipient rejected') ||
          lowerLine.includes('address rejected') ||
          lowerLine.includes('no such mailbox') ||
          lowerLine.includes('account disabled') ||
          lowerLine.includes('mailbox not found')
        )

        if (isRejection) {
          const cleanReason = lastLine.replace(/^\d{3}[ -]/, '').trim()
          return finish({ deliverable: false, code, reason: cleanReason })
        }
        return finish({ deliverable: true, code })
      }
    })

    socket.on('error', (err) => finish({ deliverable: true, fallback: true, error: err.message }))
    socket.on('timeout', () => finish({ deliverable: true, fallback: true, error: 'timeout' }))
  })
}

/**
 * Validates email syntax strictly and verifies that the domain exists and can receive mail.
 * Also probes the recipient mail server via SMTP handshake to reject non-existent mailboxes.
 * Rejects invalid format, dummy/reserved domains, non-existent domains, null MX domains, and non-existent accounts.
 */
export async function verifyEmailDeliverability(email) {
  if (!email || typeof email !== 'string') {
    const err = new Error('Email address is required')
    err.statusCode = 400
    throw err
  }

  const cleanEmail = email.trim().toLowerCase()

  if (cleanEmail.length > 254) {
    const err = new Error('Email address cannot exceed 254 characters')
    err.statusCode = 400
    throw err
  }

  // RFC 5322 standard format verification
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(cleanEmail)) {
    const err = new Error('Please enter a valid email address with a proper domain (e.g. name@company.com)')
    err.statusCode = 400
    throw err
  }

  const parts = cleanEmail.split('@')
  if (parts.length !== 2) {
    const err = new Error('Invalid email address format')
    err.statusCode = 400
    throw err
  }

  const [localPart, domain] = parts
  if (!localPart || localPart.length > 64) {
    const err = new Error('Email username prefix cannot exceed 64 characters')
    err.statusCode = 400
    throw err
  }

  const domainParts = domain.split('.')
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    const err = new Error('Email domain must include a valid top-level domain (e.g. .com, .edu, .org)')
    err.statusCode = 400
    throw err
  }

  // Reserved, disposable, or invalid test domains
  const blockedDomains = [
    'example.com', 'example.org', 'example.net', 'test.com', 'invalid.com', 'fake.com',
    'tempmail.com', 'mailinator.com', 'dispostable.com', 'throwawaymail.com', 'guerrillamail.com',
    'sharklasers.com', '10minutemail.com', 'yopmail.com'
  ]
  if (blockedDomains.includes(domain)) {
    const err = new Error(`"${domain}" is a reserved or non-deliverable domain. Please provide an active, deliverable email address.`)
    err.statusCode = 400
    throw err
  }

  // Verify domain DNS MX / reachability
  const resolver = new dns.Resolver()
  resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4'])

  let validMxList = []
  try {
    const mxRecords = await Promise.race([
      new Promise((resolve, reject) => {
        resolver.resolveMx(domain, (err, addresses) => {
          if (err) return reject(err)
          resolve(addresses)
        })
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS_TIMEOUT')), 4000))
    ]).catch(async (mxErr) => {
      if (mxErr.code === 'ENOTFOUND' || mxErr.code === 'ENODATA' || mxErr.code === 'ESERVFAIL' || mxErr.message === 'DNS_TIMEOUT') {
        try {
          const aRecords = await dns.promises.lookup(domain)
          if (!aRecords || !aRecords.address) {
            const err = new Error('DOMAIN_NOT_FOUND')
            err.code = 'ENOTFOUND'
            throw err
          }
          return []
        } catch {
          const err = new Error('DOMAIN_NOT_FOUND')
          err.code = 'ENOTFOUND'
          throw err
        }
      }
      throw mxErr
    })

    // Check for RFC 7505 Null MX (declares no mail accepted)
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      validMxList = mxRecords.filter((r) => r.exchange && r.exchange !== '.' && r.exchange.trim() !== '')
      if (validMxList.length === 0) {
        const err = new Error(`The domain "${domain}" has declared that it does not accept incoming emails (null MX). Please provide a valid email address.`)
        err.statusCode = 400
        throw err
      }
      validMxList.sort((a, b) => a.priority - b.priority)
    }
  } catch (err) {
    if (err.statusCode === 400) throw err
    if (err.message === 'DOMAIN_NOT_FOUND' || err.code === 'ENOTFOUND') {
      const bErr = new Error(`The email domain "${domain}" does not exist or has no active mail server. Please enter a valid, reachable email address.`)
      bErr.statusCode = 400
      throw bErr
    }
    // Transient network lookup failure: fallback to checking if OS can resolve
    try {
      await dns.promises.lookup(domain)
    } catch {
      const bErr = new Error(`Unable to reach or verify email domain "${domain}". Please verify the address and try again.`)
      bErr.statusCode = 400
      throw bErr
    }
  }

  // Active SMTP Mailbox Probe (Check if the specific user/mailbox exists)
  if (validMxList.length > 0) {
    const primaryMx = validMxList[0].exchange
    const mailboxResult = await checkSmtpRecipient(cleanEmail, primaryMx)
    if (mailboxResult.deliverable === false) {
      const err = new Error(
        `The email address "${cleanEmail}" does not exist or was rejected by the mail server (${mailboxResult.reason || 'User does not exist'}). Please check for typos and enter a valid, reachable email address.`
      )
      err.statusCode = 400
      throw err
    }
  }

  return cleanEmail
}

export const emailService = {
  isConfigured: () => checkIsConfigured(),

  verifyConnection: async () => {
    const client = getTransporter()
    if (!client) throw new Error('SMTP is not configured with active credentials.')
    return await client.verify()
  },

  verifyEmailDeliverability,

  /**
   * General email sending function.
   */
  sendMail: async ({ to, subject, html, text }) => {
    const client = getTransporter()

    if (!checkIsConfigured() || !client) {
      console.log(`\n========================================================`)
      console.log(`[SMTP CREDENTIAL DISPATCH]`)
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`========================================================\n`)
      return {
        messageId: `msg-${Date.now()}`,
        accepted: [to],
        sent: true
      }
    }

    try {
      const from = process.env.SMTP_FROM || `Aivortex <${process.env.SMTP_USER}>`
      const info = await client.sendMail({ from, to, subject, html, text })
      console.log(`[Email Dispatched] To: ${to} | ID: ${info.messageId}`)
      return { ...info, sent: true }
    } catch (err) {
      console.error(`[Email Dispatch Failed] To: ${to}:`, err.message)
      throw err
    }
  },

  /**
   * Creator Welcome & Account Invitation Email Template
   */
  sendCreatorInvitation: async ({ name, creatorName, email, toEmail, tempPassword, setupUrl, userId }) => {
    const baseUrl = getAppBaseUrl()
    const targetEmail = email || toEmail
    const targetName = name || creatorName || 'Curriculum Creator'
    const subject = 'Welcome to AIVORTEX Creator Studio — Your Account Credentials'
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0F172A;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563EB; margin: 0;">AIVORTEX Institute</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px; letter-spacing: 0.05em;">CREATOR STUDIO ONBOARDING</p>
        </div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 28px;">
          <p style="font-size: 15px;">Hello <strong>${targetName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">Your curriculum faculty account has been created and activated on the AIVORTEX learning platform. Here are your official login credentials:</p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #2563EB; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #1E3A8A;">Your Account Credentials:</p>
            ${userId ? `<p style="margin: 5px 0; font-size: 14px; color: #1E293B;">User ID / Username: <strong style="font-family: monospace; background: #DBEAFE; padding: 2px 8px; border-radius: 4px; color: #1E40AF;">${userId}</strong></p>` : ''}
            <p style="margin: 5px 0; font-size: 14px; color: #1E293B;">Registered Email: <strong style="font-family: monospace; background: #DBEAFE; padding: 2px 8px; border-radius: 4px; color: #1E40AF;">${targetEmail}</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #1E293B;">Initial Password: <strong style="font-family: monospace; background: #DBEAFE; padding: 2px 8px; border-radius: 4px; color: #1E40AF;">${tempPassword || 'AivortexCreator2026!'}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #16A34A; font-weight: 700;">Account Status: Active & Ready</p>
          </div>

          <p style="font-size: 14px; color: #334155;">Please log in to your Creator Portal to build course playlists, manage modules, and submit lecture videos for review:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${setupUrl || `${baseUrl}/creator/login`}" style="background: #2563EB; color: #FFFFFF; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Sign In to Creator Studio
            </a>
          </div>

          <p style="font-size: 12px; color: #94A3B8; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 16px;">
            For security, we recommend updating your password upon your first login. If you did not expect this invitation, please contact platform administration at director@aivortex.com.
          </p>
        </div>
      </div>
    `
    return await emailService.sendMail({ to: targetEmail, subject, html })
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
    const subject = 'Password Reset Request — AIVORTEX'
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0F172A;">
        <h2 style="color: #2563EB; text-align: center;">Password Reset Request</h2>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
          <p>Hello <strong>${name || 'Student'}</strong>,</p>
          <p>We received a request to reset your password for your AIVORTEX account.</p>
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
