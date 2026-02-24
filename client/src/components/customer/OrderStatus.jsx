import React from 'react'
import './OrderStatus.css'

const OrderStatus = ({ order }) => {
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Đang chờ xử lý',
      'preparing': 'Đang chuẩn bị',
      'served': 'Đã phục vụ'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    return `badge badge-${status}`
  }

  return (
    <div className="order-status card">
      <h2>Trạng thái đơn hàng</h2>
      <div className="status-info">
        <div className="status-item">
          <span className="status-label">Mã đơn:</span>
          <span className="status-value">#{order.id || order.orderId}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Bàn số:</span>
          <span className="status-value">{order.tableCode || order.tableId}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Trạng thái:</span>
          <span className={getStatusClass(order.status)}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Tổng tiền:</span>
          <span className="status-value">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(order.totalAmount || order.total || 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrderStatus



