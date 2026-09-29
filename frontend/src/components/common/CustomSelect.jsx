import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * CustomSelect — Modern, High-End Dropdown Component
 * Replaces default browser <select> with a sleek, accessible,
 * custom-rendered floating menu with smooth hover and active states.
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  prefix = '',
  className = '',
  style = {},
  menuStyle = {},
  disabled = false,
  id
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Normalize options: supports array of strings OR array of { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label !== undefined ? opt.label : (opt.title || opt.name || String(opt.value))
      }
    }
    return { value: opt, label: opt }
  })

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  const displayText = selectedOption
    ? (prefix ? `${prefix}${selectedOption.label}` : selectedOption.label)
    : placeholder

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
          gap: 10,
          background: '#FFFFFF',
          border: `1.5px solid ${isOpen ? '#2563EB' : '#CBD5E1'}`,
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#0F172A',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.15s ease-in-out',
          textAlign: 'left',
          opacity: disabled ? 0.6 : 1,
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen && !disabled) {
            e.currentTarget.style.borderColor = '#94A3B8'
            e.currentTarget.style.background = '#F8FAFC'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen && !disabled) {
            e.currentTarget.style.borderColor = '#CBD5E1'
            e.currentTarget.style.background = '#FFFFFF'
          }
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {displayText}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: isOpen ? '#2563EB' : '#64748B',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
            flexShrink: 0
          }}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: 'min(340px, calc(100vw - 32px))',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 14px 34px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.05)',
            padding: 6,
            zIndex: 1050,
            maxHeight: 260,
            overflowY: 'auto',
            animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            ...menuStyle
          }}
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
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#2563EB' : '#1E293B',
                  background: isSelected ? '#EFF6FF' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease, color 0.12s ease',
                  marginBottom: 2
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#F1F5F9'
                    e.currentTarget.style.color = '#0F172A'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#1E293B'
                  }
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={14} style={{ color: '#2563EB', marginLeft: 8, flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
