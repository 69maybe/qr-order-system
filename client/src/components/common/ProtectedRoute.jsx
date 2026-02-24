import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasRole, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/staff/login" replace />
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/staff/dashboard" replace />
  }

  return children
}

export default ProtectedRoute



