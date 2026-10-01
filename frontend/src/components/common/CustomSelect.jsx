import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

/**
 * CustomSelect — Modern, High-End Dropdown Component
 * Replaces default browser <select> with a sleek, accessible,
 * custom-rendered floating menu with smooth hover and active states.
 * Supports auto-placement (upward/downward detection) and portal rendering.
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  prefix = '',
  icon = null,
  align = 'left',
  className = '',
  style = {},
  buttonStyle = {},
  menuStyle = {},
  disabled = false,
  id,
  portal = false,
  autoPlacement = true
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const menuRef = useRef(null)

  const [placement, setPlacement] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    openUpward: false,
    maxHeight: 280
  })

  // Normalize options: supports array of strings OR array of { value, label, sublabel, dotColor }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label !== undefined ? opt.label : (opt.title || opt.name || String(opt.value)),
        sublabel: opt.sublabel || opt.description || null,
        dotColor: opt.dotColor || null
      }
    }
    return { value: opt, label: opt, sublabel: null, dotColor: null }
  })

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))

  // Calculate coordinates & determine whether to open upward or downward
  const updatePlacement = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight

    // Approximate height: options * 44px + 16px padding
    const estimatedHeight = Math.min(normalizedOptions.length * 44 + 16, 280)
    const spaceBelow = viewportHeight - rect.bottom - 12
    const spaceAbove = rect.top - 12

    // Auto-detect whether to open upward:
    // Only open upward if space below is genuinely insufficient (< 120px) and there is more room above
    const shouldOpenUpward = autoPlacement && spaceBelow < 120 && spaceAbove > spaceBelow

    const calculatedMaxHeight = shouldOpenUpward
      ? Math.max(Math.min(spaceAbove, 320), 120)
      : Math.max(Math.min(spaceBelow, 320), 120)

    setPlacement({
      top: rect.bottom + 4,
      bottom: viewportHeight - rect.top + 4,
      left: align === 'right' ? Math.max(rect.right - rect.width, 8) : rect.left,
      width: rect.width,
      openUpward: shouldOpenUpward,
      maxHeight: calculatedMaxHeight
    })
  }, [normalizedOptions.length, autoPlacement, align])

  useLayoutEffect(() => {
    if (isOpen) {
      updatePlacement()
    }
  }, [isOpen, updatePlacement])

  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      updatePlacement()
    }

    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [isOpen, updatePlacement])

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const container = containerRef.current
      const menu = menuRef.current
      if (
        container &&
        !container.contains(e.target) &&
        (!menu || !menu.contains(e.target))
      ) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (optValue) => {
    if (disabled) return
    setIsOpen(false)
    if (onChange) {
      // Support both direct value and synthetic event { target: { value } }
      onChange({ target: { value: optValue } })
    }
  }

  const portalMenuStyle = {
    position: 'fixed',
    top: placement.openUpward ? 'auto' : `${placement.top}px`,
    bottom: placement.openUpward ? `${placement.bottom}px` : 'auto',
    left: `${placement.left}px`,
    width: `${placement.width}px`,
    minWidth: `${placement.width}px`,
    maxWidth: menuStyle?.maxWidth || '480px',
    maxHeight: `${placement.maxHeight}px`,
    background: 'var(--color-bg-card, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: 10,
    boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
    padding: 5,
    zIndex: 99999,
    overflowY: normalizedOptions.length > 6 ? 'auto' : 'hidden',
    animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box',
    ...menuStyle
  }

  const inlineMenuStyle = {
    position: 'absolute',
    top: placement.openUpward ? 'auto' : 'calc(100% + 5px)',
    bottom: placement.openUpward ? 'calc(100% + 5px)' : 'auto',
    left: align === 'right' ? 'auto' : 0,
    right: align === 'right' ? 0 : 'auto',
    minWidth: '100%',
    width: menuStyle?.width || '100%',
    maxWidth: menuStyle?.maxWidth || '420px',
    background: 'var(--color-bg-card, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: 10,
    boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(15, 23, 42, 0.12))',
    padding: 5,
    zIndex: 1050,
    maxHeight: `${placement.maxHeight || 320}px`,
    overflowY: normalizedOptions.length > 6 ? 'auto' : 'hidden',
    animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box',
    ...menuStyle
  }

  const menuContent = (
    <div
      ref={menuRef}
      role="listbox"
      style={portal ? portalMenuStyle : inlineMenuStyle}
    >
      {normalizedOptions.map((opt) => {
        const isSelected = String(opt.value) === String(value)
        return (
          <div
            key={String(opt.value)}
            role="option"
            aria-selected={isSelected}
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'flex',
              alignItems: opt.sublabel ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              padding: opt.sublabel ? '9px 12px' : '9px 12px',
              borderRadius: 8,
              fontSize: '0.86rem',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? 'var(--color-secondary, #2563EB)' : 'var(--color-text, #1E293B)',
              background: isSelected ? 'var(--color-secondary-light, #EFF6FF)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.12s ease, color 0.12s ease',
              marginBottom: 2
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = 'var(--color-bg-subtle, #F1F5F9)'
                e.currentTarget.style.color = 'var(--color-text, #0F172A)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-text, #1E293B)'
              }
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {opt.dotColor && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: opt.dotColor,
                      flexShrink: 0
                    }}
                  />
                )}
                <span style={{ fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--color-secondary, #1D4ED8)' : 'var(--color-text, #0F172A)' }}>
                  {opt.label}
                </span>
              </div>
              {opt.sublabel && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: isSelected ? 'var(--color-secondary, #2563EB)' : 'var(--color-text-secondary, #64748B)',
                    lineHeight: 1.35
                  }}
                >
                  {opt.sublabel}
                </span>
              )}
            </div>
            {isSelected && (
              <Check size={15} style={{ color: 'var(--color-secondary, #2563EB)', marginLeft: 10, marginTop: opt.sublabel ? 3 : 0, flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div
      ref={containerRef}
      id={id}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: 'var(--color-input-bg, #FFFFFF)',
          border: `1.5px solid ${isOpen ? 'var(--color-secondary, #2563EB)' : 'var(--color-input-border, #CBD5E1)'}`,
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--color-text, #0F172A)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px var(--color-secondary-light, rgba(37, 99, 235, 0.12))' : 'var(--shadow-sm)',
          transition: 'all 0.15s ease-in-out',
          textAlign: 'left',
          opacity: disabled ? 0.6 : 1,
          outline: 'none',
          boxSizing: 'border-box',
          ...buttonStyle
        }}
        onMouseEnter={(e) => {
          if (!isOpen && !disabled) {
            e.currentTarget.style.borderColor = 'var(--color-border-hover, #94A3B8)'
            e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen && !disabled) {
            e.currentTarget.style.borderColor = buttonStyle?.border?.includes('#') ? buttonStyle.borderColor || 'var(--color-input-border, #CBD5E1)' : 'var(--color-input-border, #CBD5E1)'
            e.currentTarget.style.background = 'var(--color-input-bg, #FFFFFF)'
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {icon && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: isOpen ? 'var(--color-secondary, #2563EB)' : 'var(--color-text-secondary, #64748B)',
                flexShrink: 0,
                transition: 'color 0.15s ease'
              }}
            >
              {icon}
            </span>
          )}
          {prefix && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary, #64748B)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {prefix}
            </span>
          )}
          {selectedOption?.dotColor && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: selectedOption.dotColor,
                flexShrink: 0
              }}
            />
          )}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 700,
              color: 'var(--color-text, #0F172A)',
              fontSize: '0.8125rem'
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: isOpen ? 'var(--color-secondary, #2563EB)' : 'var(--color-text-secondary, #64748B)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
            flexShrink: 0,
            marginLeft: 4
          }}
        />
      </button>

      {/* Dropdown Menu: rendered via portal or inline */}
      {isOpen && (portal ? createPortal(menuContent, document.body) : menuContent)}
    </div>
  )
}

