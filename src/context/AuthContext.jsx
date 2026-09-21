import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

function loadSecureToken() {
  try {
    return sessionStorage.getItem('auth_token') || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(loadSecureToken)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('auth_token', token)
    } else {
      sessionStorage.removeItem('auth_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('auth_user')
    }
  }, [user])

  const login = async (email, password) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      if (email && password && password.length >= 6) {
        const mockUser = {
          id: 1,
          name: email.split('@')[0],
          email,
          avatar: null,
        }
        setUser(mockUser)
        setToken('mock_token_' + Date.now())
        return { success: true }
      }
      return { success: false, error: 'Credenciales inválidas' }
    } catch {
      return { success: false, error: 'Error al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      if (name && email && password && password.length >= 8) {
        const mockUser = {
          id: Date.now(),
          name,
          email,
          avatar: null,
        }
        setUser(mockUser)
        setToken('mock_token_' + Date.now())
        return { success: true }
      }
      return { success: false, error: 'Datos de registro inválidos' }
    } catch {
      return { success: false, error: 'Error en el registro' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
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
