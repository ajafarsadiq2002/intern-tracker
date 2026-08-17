import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const isPublic = location.pathname === '/login'

  useEffect(() => {
    if (isPublic) {
      setLoading(false)
      return
    }

    auth.me()
      .then((res) => {
        setUser(res.data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isPublic, navigate])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  const canAccess = (page) => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    return (user.allowed_pages || []).includes(page)
  }

  const value = { user, loading, logout, canAccess, setUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
