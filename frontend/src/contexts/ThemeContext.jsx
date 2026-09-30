import { createContext, useContext, useState, useEffect, useRef } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
})

const THEME_STORAGE_KEY = 'aivortex_admin_theme'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') {
        return saved
      }
    } catch {
      // localStorage might be unavailable in restricted environments
    }
    return 'light'
  })

  const applyThemeToDom = (newTheme) => {
    try {
      const root = document.documentElement
      const body = document.body
      root.setAttribute('data-theme', newTheme)
      body.setAttribute('data-theme', newTheme)
      if (newTheme === 'dark') {
        root.classList.add('dark-theme')
        body.classList.add('dark-theme')
      } else {
        root.classList.remove('dark-theme')
        body.classList.remove('dark-theme')
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // ignore
    }
    applyThemeToDom(theme)
  }, [theme])

  const transitionTimeoutRef = useRef(null)

  const toggleTheme = () => {
    try {
      const root = document.documentElement
      const body = document.body
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      root.classList.add('theme-transition')
      body?.classList.add('theme-transition')
      const nextTheme = theme === 'dark' ? 'light' : 'dark'
      // Apply to DOM synchronously so CSS variables and DOM tree transition in sync with React state
      applyThemeToDom(nextTheme)
      setThemeState(nextTheme)
      transitionTimeoutRef.current = setTimeout(() => {
        root.classList.remove('theme-transition')
        body?.classList.remove('theme-transition')
        transitionTimeoutRef.current = null
      }, 500)
    } catch {
      setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      try {
        const root = document.documentElement
        const body = document.body
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
        }
        root.classList.add('theme-transition')
        body?.classList.add('theme-transition')
        applyThemeToDom(newTheme)
        setThemeState(newTheme)
        transitionTimeoutRef.current = setTimeout(() => {
          root.classList.remove('theme-transition')
          body?.classList.remove('theme-transition')
          transitionTimeoutRef.current = null
        }, 500)
      } catch {
        setThemeState(newTheme)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
