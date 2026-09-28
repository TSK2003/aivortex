import React from 'react'

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
  const getBadgeStyle = () => {
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
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '22px 24px',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#CBD5E1'
        e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(15, 23, 42, 0.08)'
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0'
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
        if (onClick) e.currentTarget.style.transform = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: '#64748B',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
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
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
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
            color: '#0F172A',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 8
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
                color: '#64748B',
                fontWeight: 500
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
