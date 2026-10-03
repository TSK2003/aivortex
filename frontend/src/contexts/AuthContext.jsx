import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify and refresh session with live backend on initial mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = localStorage.getItem('apex_token')
        if (token) {
          // Clear any legacy mock demo tokens
          if (token.startsWith('demo-token-')) {
            localStorage.removeItem('apex_token')
            localStorage.removeItem('apex_user')
            setUser(null)
            setLoading(false)
            return
          }

          const res = await api.auth.me()
          if (res?.data?.user) {
            setUser(res.data.user)
            localStorage.setItem('apex_user', JSON.stringify(res.data.user))
          }
        }
      } catch (err) {
        // Only discard session if explicitly rejected with 401/403 by authoritative server
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem('apex_token')
          localStorage.removeItem('apex_user')
          setUser(null)
        } else {
          console.warn('Backend session verification note:', err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const demoLogin = useCallback(async (role = 'student') => {
    try {
      const res = await api.auth.demoLogin(role)
      const userData = res.data?.user
      const token = res.data?.token

      if (!userData || !token) {
        throw new Error('Invalid demo authentication response from server.')
      }

      localStorage.setItem('apex_token', token)
      localStorage.setItem('apex_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      throw new Error(err.message || 'Demo authentication failed')
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.auth.login(email, password)
      const userData = res.data?.user
      const token = res.data?.token

      if (!userData || !token) {
        throw new Error('Invalid authentication response from server.')
      }

      localStorage.setItem('apex_token', token)
      localStorage.setItem('apex_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      return { success: false, error: err.message || 'Authentication failed' }
    }
  }, [])

  const studentLogin = useCallback(async (email, password) => {
    return login(email, password)
  }, [login])

  const adminLogin = useCallback(async (email, password) => {
    return login(email, password)
  }, [login])

  const creatorLogin = useCallback(async (email, password) => {
    return login(email, password)
  }, [login])

  const signup = useCallback(async (name, email, password) => {
    try {
      const res = await api.auth.register(name, email, password)
      const userData = res.data?.user
      const token = res.data?.token

      if (userData && token) {
        localStorage.setItem('apex_token', token)
        localStorage.setItem('apex_user', JSON.stringify(userData))
        setUser(userData)
      }
      return { success: true, user: userData }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('apex_token')
      localStorage.removeItem('apex_user')
      setUser(null)
    }
  }, [])

  const updateProfile = useCallback((profileData) => {
    setUser((prev) => {
      const updated = { ...prev, ...profileData }
      localStorage.setItem('apex_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const normalizedRole = (user?.role || '').toLowerCase()

  const value = {
    user,
    role: normalizedRole,
    student: (normalizedRole === 'student' || normalizedRole === 'admin') ? user : null,
    creator: normalizedRole === 'creator' ? user : null,
    admin: normalizedRole === 'admin' ? user : null,
    loading,
    login,
    demoLogin,
    studentLogin,
    adminLogin,
    creatorLogin,
    signup,
    logout,
    updateProfile,
    isAuthenticated: Boolean(user),
    isStudentAuthenticated: () => normalizedRole === 'student',
    isAdminAuthenticated: () => normalizedRole === 'admin',
    isCreatorAuthenticated: () => normalizedRole === 'creator'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
