import { useState, useEffect, useRef } from 'react'

function AnimatedCounter({ target, decimals = 0, suffix = '', duration = 1800, isStarted }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!isStarted) return
    let startTimestamp = null
    let rafId = null

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic: brisk start, gentle landing
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = ease * target
      setVal(current)

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        setVal(target)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [target, duration, isStarted])

  const formatted = decimals > 0
    ? val.toFixed(decimals) + suffix
    : Math.floor(val).toLocaleString('en-US') + suffix

  return <span>{formatted}</span>
}

/**
 * StatsCounterStrip — Dynamic Counting Metrics
 * Counts up numbers on site open, with no bounding border and sleek vertical gray divider lines between each number.
 */
export default function StatsCounterStrip() {
  const [hasStarted, setHasStarted] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    // Start counting immediately on page open
    setHasStarted(true)

    // Also support intersection observer in case scrolled into view later
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasStarted(true)
          }
        },
        { threshold: 0.1 }
      )

      if (containerRef.current) {
        observer.observe(containerRef.current)
      }

      return () => observer.disconnect()
    }
  }, [])

  const stats = [
    { target: 24000, decimals: 0, suffix: '+', label: 'Engineers & Students Upskilled' },
    { target: 94.8, decimals: 1, suffix: '%', label: 'Career Transition & Placement Rate' },
    { target: 45, decimals: 0, suffix: '+', label: 'Production AI Courses' },
    { target: 120, decimals: 0, suffix: '+', label: 'Enterprise Capstone Repositories' },
  ]

  return (
    <section className="stats-counter-section" ref={containerRef}>
      <div className="container">
        <div className="stats-counter-row">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-counter-block">
              <div className="stat-counter-num">
                <AnimatedCounter
                  target={stat.target}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  isStarted={hasStarted}
                />
              </div>
              <div className="stat-counter-label">
                {stat.label}
              </div>
              {idx < stats.length - 1 && (
                <div className="stat-vertical-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
