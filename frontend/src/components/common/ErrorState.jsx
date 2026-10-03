import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

/**
 * ErrorState - Clear, actionable error display with retry trigger
 */
export default function ErrorState({
  title = 'Unable to load content',
  message = 'An unexpected network error occurred while communicating with the server.',
  onRetry,
  retryLabel = 'Try Again'
}) {
  return (
    <div
      style={{
        padding: '32px 24px',
        background: 'var(--color-danger-subtle, #FEF2F2)',
        border: '1px solid var(--color-danger-border, #FECACA)',
        borderRadius: 'var(--radius-md, 8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 12,
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--color-danger-subtle, #FEE2E2)',
          color: 'var(--color-danger, #DC2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AlertCircle size={22} />
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-danger-text, #991B1B)' }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-danger-text, #B91C1C)', maxWidth: 460 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-danger, #DC2626)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '7px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 4
          }}
        >
          <RotateCcw size={14} />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  )
}
