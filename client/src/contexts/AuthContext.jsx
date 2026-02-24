import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/api/auth/me')
        setUser(response.data.user)
      } catch (error) {
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async ({ username, password }) => {
    try {
      const response = await api.post('/api/auth/login', { username, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
      return user
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Sai tên đăng nhập hoặc mật khẩu')
      }
      throw new Error(error.response?.data?.message || 'Không thể đăng nhập')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAuthenticated = () => {
    return !!user
  }

  const hasRole = (roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
