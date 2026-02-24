import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Customer Interface (No auth required)
import CustomerOrdering from './pages/CustomerOrdering'

// Staff Interface
import StaffLogin from './pages/StaffLogin'
import StaffDashboard from './pages/StaffDashboard'

// Admin Interface
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Customer Route - No authentication required */}
          <Route path="/order/:tableId" element={<CustomerOrdering />} />
          
          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/staff/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App



