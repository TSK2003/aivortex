import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Modern production-grade StatCard component for Admin Portal.
 * Clean, minimal, high-contrast, accessible. Brand: Black & White only.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  iconBg = '#EFF6FF',
  iconColor = '#2563EB',
  onClick
}) {
  const { isDark } = useTheme()

  return (
    <div
      onClick={onClick}
      className="stat-card"
      style={{
        background: isDark ? '#1C1D21' : '#FFFFFF',
        borderRadius: '14px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E7EB',
        padding: '22px 24px',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.25)' : '#CBD5E1'
        e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'
        e.currentTarget.style.boxShadow = isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      {/* Top Row: Icon on LEFT, Title on RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : iconBg,
              color: isDark ? '#FFFFFF' : iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: isDark ? '#9B9DA3' : '#475569',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1.25,
            maxWidth: 120,
            display: 'block'
          }}
        >
          {title}
        </span>
      </div>

      {/* Middle & Bottom: Extra Large Number + Subtext */}
      <div>
        <div
          style={{
            fontSize: '2.85rem',
            fontWeight: 900,
            color: isDark ? '#FFFFFF' : '#0F172A',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 8
          }}
        >
          {value ?? '—'}
        </div>

        {subtext && (
          <div
            style={{
              fontSize: '0.8125rem',
              color: isDark ? '#94A3B8' : '#64748B',
              fontWeight: 500,
              lineHeight: 1.35
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}
