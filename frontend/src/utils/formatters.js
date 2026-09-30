/**
 * Utility formatters for currency, dates, percentages, and duration
 */

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === 0 || amount === '0') return 'Free'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export const formatPercentage = (value) => {
  return `${Math.min(100, Math.max(0, Math.round(value || 0)))}%`
}

/**
 * International Country Codes & Phone Configuration
 */
export const INTERNATIONAL_COUNTRY_CODES = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳', minDigits: 10, maxDigits: 10, startsWithRegex: /^[6-9]/, placeholder: '98765 00002' },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸', minDigits: 10, maxDigits: 10, startsWithRegex: /^[2-9]/, placeholder: '987 654 3210' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧', minDigits: 10, maxDigits: 11, startsWithRegex: null, placeholder: '7911 123456' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦', minDigits: 10, maxDigits: 10, startsWithRegex: /^[2-9]/, placeholder: '987 654 3210' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺', minDigits: 9, maxDigits: 9, startsWithRegex: null, placeholder: '412 345 678' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬', minDigits: 8, maxDigits: 8, startsWithRegex: /^[689]/, placeholder: '8123 4567' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪', minDigits: 9, maxDigits: 9, startsWithRegex: null, placeholder: '50 123 4567' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪', minDigits: 10, maxDigits: 11, startsWithRegex: null, placeholder: '151 23456789' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷', minDigits: 9, maxDigits: 9, startsWithRegex: null, placeholder: '6 12 34 56 78' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵', minDigits: 10, maxDigits: 10, startsWithRegex: null, placeholder: '90 1234 5678' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦', minDigits: 9, maxDigits: 9, startsWithRegex: null, placeholder: '50 123 4567' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿', minDigits: 8, maxDigits: 10, startsWithRegex: null, placeholder: '21 123 4567' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾', minDigits: 9, maxDigits: 10, startsWithRegex: null, placeholder: '12 345 6789' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦', minDigits: 9, maxDigits: 9, startsWithRegex: null, placeholder: '71 123 4567' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷', minDigits: 10, maxDigits: 11, startsWithRegex: null, placeholder: '11 98765 4321' },
  { code: 'OTHER', dialCode: '+', name: 'Other (International)', flag: '🌐', minDigits: 7, maxDigits: 15, startsWithRegex: null, placeholder: '1234567890' }
]

/**
 * Parses any phone string into { countryCode, nationalNumber }
 */
export const parsePhoneNumber = (phoneStr) => {
  if (!phoneStr || typeof phoneStr !== 'string') {
    return { countryCode: '+91', nationalNumber: '' }
  }

  const trimmed = phoneStr.trim()
  if (!trimmed) {
    return { countryCode: '+91', nationalNumber: '' }
  }

  // Sort dial codes by length descending so multi-digit codes (+971, +966) match before (+91)
  const sorted = [...INTERNATIONAL_COUNTRY_CODES]
    .filter((c) => c.dialCode !== '+')
    .sort((a, b) => b.dialCode.length - a.dialCode.length)

  // 1. If prefixed with '+'
  if (trimmed.startsWith('+')) {
    for (const c of sorted) {
      if (trimmed.startsWith(c.dialCode)) {
        const remainder = trimmed.slice(c.dialCode.length).trim()
        return { countryCode: c.dialCode, nationalNumber: remainder }
      }
    }
    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/)
    if (match) {
      return { countryCode: match[1], nationalNumber: match[2] }
    }
  }

  // 2. Starts with '91' followed by 10 digits (total 12 digits)
  const digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) {
    return { countryCode: '+91', nationalNumber: digits.slice(2) }
  }

  // 3. 10 digits Indian number (starting with 6-9)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return { countryCode: '+91', nationalNumber: trimmed }
  }

  // 4. Fallback default to +91
  return { countryCode: '+91', nationalNumber: trimmed }
}

/**
 * Format to standard international E.164 format: +<countryCode><digits>
 */
export const formatToE164 = (countryCode, nationalNumber) => {
  if (!nationalNumber || !nationalNumber.trim()) return null
  const dialDigits = (countryCode || '+91').replace(/\D/g, '')
  const subscriberDigits = nationalNumber.replace(/\D/g, '')
  if (!subscriberDigits) return null
  return `+${dialDigits}${subscriberDigits}`
}

/**
 * Validate phone number based on selected country code
 */
export const validateInternationalPhone = (countryCode, nationalNumber) => {
  if (!nationalNumber || !nationalNumber.trim()) return ''
  const trimmed = nationalNumber.trim()

  if (/[^0-9\s\-()]/.test(trimmed)) {
    return 'Only digits, spaces, hyphens, and parentheses are allowed'
  }

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 0) {
    return 'Please enter a valid phone number.'
  }

  const code = countryCode || '+91'

  if (code === '+91') {
    if (digits.length !== 10) {
      return 'Please enter a valid 10-digit Indian phone number.'
    }
    if (!/^[6-9]/.test(digits)) {
      return 'Indian mobile numbers must start with 6, 7, 8, or 9.'
    }
    return ''
  }

  if (code === '+1') {
    if (digits.length !== 10) {
      return 'Please enter a valid 10-digit phone number.'
    }
    if (/^[01]/.test(digits)) {
      return 'Area code cannot start with 0 or 1.'
    }
    return ''
  }

  if (code === '+44') {
    if (digits.length < 10 || digits.length > 11) {
      return 'Please enter a valid 10–11 digit phone number.'
    }
    return ''
  }

  if (code === '+61') {
    if (digits.length !== 9) {
      return 'Please enter a valid 9-digit Australian phone number.'
    }
    return ''
  }

  if (code === '+65') {
    if (digits.length !== 8) {
      return 'Please enter a valid 8-digit Singapore phone number.'
    }
    return ''
  }

  if (code === '+971') {
    if (digits.length !== 9) {
      return 'Please enter a valid 9-digit UAE phone number.'
    }
    return ''
  }

  // Generic international rules
  if (digits.length < 7) {
    return 'Please enter a valid phone number (too short).'
  }
  if (digits.length > 15) {
    return 'Please enter a valid phone number (maximum 15 digits).'
  }

  return ''
}
