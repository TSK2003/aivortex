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
