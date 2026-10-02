import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * LoadingState - Subtle enterprise loading skeleton & spinner
 */
export default function LoadingState({ message = 'Loading data...', minHeight = 220 }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 12,
        padding: '32px 16px'
      }}
    >
      <Loader2 size={26} className="spinner" style={{ color: 'var(--color-primary, #2563EB)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)', fontWeight: 600 }}>{message}</span>
    </div>
  )
}
