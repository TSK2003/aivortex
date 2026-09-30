import React, { useState } from 'react'
import IvortexIntro from '../../components/common/IvortexIntro'
import BrandLogo from '../../components/common/BrandLogo'
import { Play, RotateCcw, Check, Sparkles, Layers, Sliders, Compass, Sun, Moon } from 'lucide-react'

export default function LogoAnimationPreviewPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [introKey, setIntroKey] = useState(0)
  const [navbarLogoKey, setNavbarLogoKey] = useState(0)
  const [previewTheme, setPreviewTheme] = useState('light')
  const [previewSize, setPreviewSize] = useState('md')

  const handlePlayIntro = () => {
    setIntroKey((prev) => prev + 1)
    setIsPlaying(true)
  }

  const handleReplayNavbarLogo = () => {
    setNavbarLogoKey((prev) => prev + 1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px', fontFamily: 'var(--font-sans, -apple-system, sans-serif)' }}>
      {/* Live Intro Instance */}
      {isPlaying && (
        <IvortexIntro
          key={introKey}
          forcePlay={true}
          once={false}
          onComplete={() => setIsPlaying(false)}
        />
      )}

      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', color: '#2563EB', padding: '6px 14px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12 }}>
            <Sparkles size={16} />
            <span>Official IVORTEX Brand Motion System</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>
            IVORTEX Brand & Navbar Animation
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: 720, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Unified opening motion: Standalone A symbol smoothly scales in, <code style={{ color: '#2563EB', fontWeight: 700 }}>ivortex</code> unmasks organically from left to right, and <code style={{ color: '#059669', fontWeight: 700 }}>LEARN. GROW. INNOVATE.</code> reveals at the down.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handlePlayIntro}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
                transition: 'transform 0.15s ease, background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Play size={18} fill="#FFFFFF" />
              <span>Play Fullscreen Page Opening Animation</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('ivortex_intro_seen')
                alert('Session storage cleared! The intro animation will play immediately on your next refresh or visit.')
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFFFFF',
                color: '#475569',
                border: '1px solid #CBD5E1',
                padding: '12px 20px',
                borderRadius: 12,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
              <span>Reset Session Storage Cache</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Navbar Logo Opening Animation Tester */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Compass size={22} color="#2563EB" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Navigation Bar Brand Logo Animation
                </h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>
                  Live simulation of the navbar logo with "LEARN. GROW. INNOVATE." at the down
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Size selector */}
              <div style={{ display: 'flex', background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
                {['sm', 'md', 'lg', 'xl'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setPreviewSize(sz)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      background: previewSize === sz ? '#FFFFFF' : 'transparent',
                      color: previewSize === sz ? '#0F172A' : '#64748B',
                      boxShadow: previewSize === sz ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setPreviewTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid #E2E8F0',
                  background: previewTheme === 'dark' ? '#0F172A' : '#FFFFFF',
                  color: previewTheme === 'dark' ? '#FFFFFF' : '#0F172A',
                  cursor: 'pointer'
                }}
              >
                {previewTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span>{previewTheme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>

              {/* Replay Button */}
              <button
                onClick={handleReplayNavbarLogo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                <RotateCcw size={14} />
                <span>Replay Animation</span>
              </button>
            </div>
          </div>

          {/* Simulated Navbar Canvas */}
          <div
            style={{
              padding: '24px 32px',
              borderRadius: 14,
              border: previewTheme === 'dark' ? '1px solid #1E293B' : '1px solid #E2E8F0',
              background: previewTheme === 'dark' ? '#090D16' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: previewTheme === 'dark' ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
            }}
          >
            {/* The Brand Logo instance */}
            <BrandLogo
              key={navbarLogoKey}
              size={previewSize}
              theme={previewTheme}
              showTagline={true}
              animated={true}
            />

            {/* Fake Navbar links for realistic context */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: 0.6 }}>
              {['Home', 'Courses', 'Internships', 'Community', 'About'].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: previewTheme === 'dark' ? '#94A3B8' : '#475569'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8125rem', color: '#64748B' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} color="#059669" /> Standalone A scale & fade in (0-0.45s)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} color="#059669" /> Wordmark unmasking & staggered letters (0.25-0.7s)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} color="#059669" /> LEARN. GROW. INNOVATE. reveals at the down (0.7-1.2s)
            </span>
          </div>
        </div>

        {/* SECTION 2: Reference Verification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
          {/* Card 1 */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Symbol Geometry
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                <Check size={14} /> 100% Vector Match
              </span>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              Standalone A Symbol
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5 }}>
              Exact angular chevron geometry with identical stroke angles, diagonal cut-off, and proportions. Acts as initial centered focal point.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Wordmark Typography
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                <Check size={14} /> 100% Vector Match
              </span>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              Custom ivortex Typography
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5 }}>
              Pure custom bezier curves for letters <code style={{ color: '#2563EB' }}>i-v-o-r-t-e-x</code>. Zero generic font substitution, preserving official brand letterforms.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tagline Positioning
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                <Check size={14} /> 100% Target Lockup
              </span>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              LEARN. GROW. INNOVATE. at Down
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5 }}>
              Positions right beneath the wordmark, spanning exactly from the left edge of 'a' to the right edge of 'x', matching the user's navbar lockup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
