import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Modern production-grade StatCard component for Admin Portal.
 * Clean, minimal, high-contrast, accessible.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  badge,
  badgeType = 'neutral', // 'success' | 'warning' | 'info' | 'danger' | 'neutral'
  iconBg = '#EFF6FF',
  iconColor = '#2563EB',
  onClick
}) {
  const { isDark } = useTheme()

  const getBadgeStyle = () => {
    if (isDark) {
      switch (badgeType) {
        case 'success':
          return { background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' }
        case 'warning':
          return { background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }
        case 'danger':
          return { background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
        case 'info':
          return { background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }
        default:
          return { background: '#162032', color: '#94A3B8', border: '1px solid #1E293B' }
      }
    }

    switch (badgeType) {
      case 'success':
        return { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }
      case 'warning':
        return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }
      case 'danger':
        return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
      case 'info':
        return { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }
      default:
        return { background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }
    }
  }

  return (
    <div
      onClick={onClick}
      className="stat-card"
      style={{
        background: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: '16px',
        border: '1px solid var(--color-border, #E2E8F0)',
        padding: '22px 24px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px 0 rgba(15, 23, 42, 0.04))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-hover, #CBD5E1)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 6px 16px -2px rgba(15, 23, 42, 0.08))'
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border, #E2E8F0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 3px 0 rgba(15, 23, 42, 0.04))'
        if (onClick) e.currentTarget.style.transform = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--color-text-tertiary, #64748B)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'color 0.3s ease'
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: isDark ? 'rgba(59, 130, 246, 0.15)' : iconBg,
              color: isDark ? '#60A5FA' : iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: 'var(--color-text, #0F172A)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 8,
            transition: 'color 0.3s ease'
          }}
        >
          {value ?? '—'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {badge && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                ...getBadgeStyle()
              }}
            >
              {badge}
            </span>
          )}
          {subtext && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary, #64748B)',
                fontWeight: 500,
                transition: 'color 0.3s ease'
              }}
            >
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
