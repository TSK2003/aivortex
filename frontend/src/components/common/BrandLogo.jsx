import React, { useState, useEffect } from 'react'
import './BrandLogo.css'

/**
 * BrandLogo Component
 * 
 * Recreated with 100% fidelity to the official reference image:
 * - Left: Big First "A" Emblem
 * - Right: Stylized "A" initial mark followed by "ivortex", with "LEARN. GROW. INNOVATE." underneath
 * - Dynamic Animation: The company name emerges and slides out smoothly from inside the Big First "A"
 *   both on load and upon hover.
 */
export default function BrandLogo({
  theme = 'light', // 'light' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  showName = true,
  showTagline = true,
  animated = true,
  className = '',
  style = {},
  onClick
}) {
  const isDark = theme === 'dark'
  const [animKey, setAnimKey] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Size mapping (height in px)
  const sizeMap = {
    sm: { H: 34, gap: 6 },
    md: { H: 44, gap: 8 },
    lg: { H: 54, gap: 10 },
    xl: { H: 68, gap: 12 },
    hero: { H: 88, gap: 16 }
  }

  const currentSize = sizeMap[size] || sizeMap.md
  const H = typeof style.height === 'number' ? style.height : currentSize.H
  const gap = currentSize.gap

  // Bounding box ratios based on reference image (Big A: 142x150, Wordmark: 415x150)
  const bigAWidth = Math.round(H * (142 / 150))
  const wordmarkWidth = Math.round(H * (415 / 150))

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (animated) {
      setAnimKey((prev) => prev + 1)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const bigASrc = isDark ? '/brand-big-a-white.png' : '/brand-big-a.png'
  const wordmarkSrc = isDark ? '/brand-wordmark-white.png' : '/brand-wordmark.png'

  return (
    <div
      key={`brand-logo-${animKey}`}
      className={`brand-logo-component ${animated ? 'brand-logo-animated' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        textDecoration: 'none',
        lineHeight: 1,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        height: `${H}px`,
        ...style
      }}
      title="Aivortex — Learn. Grow. Innovate."
    >
      {/* 1. The Big First "A" Emblem (Foreground Anchor) */}
      <div
        className="brand-logo-icon-wrap"
        style={{
          height: `${H}px`,
          width: `${bigAWidth}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          zIndex: 3
        }}
      >
        <img
          src={bigASrc}
          alt="AIVORTEX Emblem"
          className="brand-logo-big-a-img"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none'
          }}
          loading="eager"
        />
      </div>

      {/* 2. Company Name & Tagline (Dynamically Emerges from inside the Big First A) */}
      {showName && (
        <div
          className="brand-logo-text-wrap"
          style={{
            height: `${H}px`,
            width: `${wordmarkWidth}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}
        >
          <img
            src={wordmarkSrc}
            alt="Aivortex — Learn. Grow. Innovate."
            className="brand-logo-wordmark-img"
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none'
            }}
            loading="eager"
          />
        </div>
      )}
    </div>
  )
}
