import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop
 * Automatically resets window scroll position to the absolute top (0, 0)
 * whenever the route or pathname changes.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Reset scroll immediately on both window and document element
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [pathname, search])

  return null
}
