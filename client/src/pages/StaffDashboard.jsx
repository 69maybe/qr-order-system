import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import OrderList from '../components/staff/OrderList'
import OrderDetail from '../components/staff/OrderDetail'
import api from '../services/api'
import './StaffDashboard.css'

const StaffDashboard = () => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const statusMap = {
    cho_xu_ly: 'pending',
    dang_chuan_bi: 'preparing',
    da_phuc_vu: 'served',
    huy: 'cancelled'
  }

  const statusReverseMap = Object.entries(statusMap).reduce((acc, [backend, frontend]) => {
    acc[frontend] = backend
    return acc
  }, {})

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders')
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const normalized = response.data
        .map(order => {
          const tableLabel = order.tableCode || order.tableId
          return {
            id: order.id,
            tableId: tableLabel,
            tableCode: order.tableCode,
            status: statusMap[order.status] || order.status,
            items: order.items.map(item => ({
              id: item.menuItemId,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            total: order.totalAmount,
            createdAt: order.createdAt,
            isPaid: order.isPaid
          }
        })
        // Chỉ hiển thị đơn hàng đã phục vụ trong 24h
        .filter(order => {
          if (order.status === 'served') {
            const orderDate = new Date(order.createdAt)
            return orderDate >= twentyFourHoursAgo
          }
          // Hiển thị tất cả đơn hàng chưa phục vụ (pending, preparing)
          return true
        })
      
      setOrders(normalized)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, {
        status: statusReverseMap[newStatus] || newStatus
      })

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      setSelectedOrder(prev =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
      )
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng')
    }
  }

  const handlePaymentUpdate = async (orderId, isPaid) => {
    try {
      await api.patch(`/api/orders/${orderId}/payment`, { isPaid })

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, isPaid } : order
        )
      )

      setSelectedOrder(prev =>
        prev && prev.id === orderId ? { ...prev, isPaid } : prev
      )
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Có lỗi xảy ra khi cập nhật thanh toán')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const preparingOrders = orders.filter(order => order.status === 'preparing')
  const servedOrders = orders.filter(order => order.status === 'served')

  if (loading) {
    return (
      <div className="staff-dashboard loading">
        <div>Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className="staff-dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Quản lý đơn hàng</h1>
              <p>Danh sách đơn hàng theo thời gian thực</p>
            </div>
            <div className="header-actions">
              {hasRole(['admin']) && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Quản trị viên
                </button>
              )}
              <div className="user-info">
                <span>Xin chào, {user?.username}</span>
                <button
                  className="btn btn-danger"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content container">
        <div className="dashboard-main">
          <div className="orders-section">
            <OrderList
              orders={orders}
              pendingOrders={pendingOrders}
              preparingOrders={preparingOrders}
              servedOrders={servedOrders}
              selectedOrder={selectedOrder}
              onOrderSelect={handleOrderSelect}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>

          {selectedOrder && (
            <div className="order-detail-section">
              <OrderDetail
                order={selectedOrder}
                onStatusUpdate={handleStatusUpdate}
                onPaymentUpdate={handlePaymentUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard



