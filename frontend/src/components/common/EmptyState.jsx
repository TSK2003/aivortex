import React from 'react'
import { FolderOpen } from 'lucide-react'

/**
 * EmptyState - Enterprise Consistent Empty State Display
 * Avoids fake data fallbacks by gracefully informing the user of the real state.
 */
export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There is currently no data available for this section.',
  actionLabel,
  onAction,
  style = {}
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        background: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 8,
        border: '1px solid var(--color-border, #E2E8F0)',
        ...style
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'var(--color-bg-subtle, #F1F5F9)',
          color: 'var(--color-text-tertiary, #64748B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}
      >
        <Icon size={24} />
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--color-text, #0F172A)',
          margin: '0 0 6px 0',
          letterSpacing: '-0.01em'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#64748B',
          maxWidth: 420,
          margin: '0 0 20px 0',
          lineHeight: 1.5
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary"
          style={{
            padding: '8px 18px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: 6
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
