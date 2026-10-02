import React from 'react'

/**
 * StatusBadge - Enterprise Semantic Status Indicator
 * Restrained pill badge with clear semantic color matching product state.
 */

const STATUS_CONFIGS = {
  ACTIVE: { bg: '#DCFCE7', text: '#15803D', label: 'Active' },
  PUBLISHED: { bg: '#DCFCE7', text: '#15803D', label: 'Published' },
  APPROVED: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Approved' },
  COMPLETED: { bg: '#DCFCE7', text: '#15803D', label: 'Completed' },
  PAID: { bg: '#DCFCE7', text: '#15803D', label: 'Paid' },
  SUBMITTED: { bg: '#FEF3C7', text: '#B45309', label: 'Submitted' },
  SUBMITTED_FOR_REVIEW: { bg: '#FEF3C7', text: '#B45309', label: 'In Review' },
  PENDING: { bg: '#FEF3C7', text: '#B45309', label: 'Pending' },
  DRAFT: { bg: '#F1F5F9', text: '#475569', label: 'Draft' },
  INACTIVE: { bg: '#F1F5F9', text: '#64748B', label: 'Inactive' },
  SUSPENDED: { bg: '#FEE2E2', text: '#B91C1C', label: 'Suspended' },
  RETURNED_FOR_EDIT: { bg: '#FEE2E2', text: '#B91C1C', label: 'Changes Requested' },
  REJECTED: { bg: '#FEE2E2', text: '#B91C1C', label: 'Rejected' },
  FAILED: { bg: '#FEE2E2', text: '#B91C1C', label: 'Failed' },
  VALID: { bg: '#DCFCE7', text: '#15803D', label: 'Valid' },
  REVOKED: { bg: '#FEE2E2', text: '#B91C1C', label: 'Revoked' },
  UPLOADED: { bg: '#F1F5F9', text: '#475569', label: 'Uploaded' },
  EXPIRED: { bg: '#FEE2E2', text: '#B91C1C', label: 'Expired' },
  UNPUBLISHED: { bg: '#F1F5F9', text: '#64748B', label: 'Unpublished' },
  ARCHIVED: { bg: '#F1F5F9', text: '#64748B', label: 'Archived' },
  PROCESSING: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Processing' }
}

export default function StatusBadge({ status = 'DRAFT', label, size = 'sm' }) {
  const normStatus = String(status || '').toUpperCase().trim()
  const conf = STATUS_CONFIGS[normStatus] || { bg: '#F1F5F9', text: '#475569', label: status }

  const displayText = label || conf.label

  const isSmall = size === 'sm'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: 6,
        background: conf.bg,
        color: conf.text,
        fontSize: isSmall ? '0.72rem' : '0.8125rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        lineHeight: 1.4,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? 5 : 6,
          height: isSmall ? 5 : 6,
          borderRadius: '50%',
          background: conf.text,
          flexShrink: 0
        }}
      />
      {displayText}
    </span>
  )
}
