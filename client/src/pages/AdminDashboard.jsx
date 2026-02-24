import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MenuManagement from '../components/admin/MenuManagement'
import TableManagement from '../components/admin/TableManagement'
import RevenueStatistics from '../components/admin/RevenueStatistics'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('menu')

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
  }

  const tabs = [
    { id: 'menu', label: 'Quản lý Menu', icon: '🍽️' },
    { id: 'tables', label: 'Quản lý Bàn ăn', icon: '🪑' },
    { id: 'revenue', label: 'Thống kê Doanh thu', icon: '📊' }
  ]

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Quản trị viên</h1>
              <p>Bảng điều khiển quản lý</p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/staff/dashboard')}
              >
                Quản lý đơn hàng
              </button>
              <button
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-container container">
        <div className="tabs-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'tables' && <TableManagement />}
          {activeTab === 'revenue' && <RevenueStatistics />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard



