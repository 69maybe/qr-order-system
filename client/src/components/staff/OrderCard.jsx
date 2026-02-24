import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import './OrderCard.css'

const OrderCard = ({ order, isSelected, onClick }) => {
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'preparing': 'Đang chuẩn bị',
      'served': 'Đã phục vụ'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    return `badge badge-${status}`
  }

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
    locale: vi
  })

  return (
    <div
      className={`order-card card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="order-card-header">
        <div>
          <h3>Đơn hàng #{order.id}</h3>
          <p className="table-number">Bàn {order.tableId}</p>
        </div>
        <span className={getStatusClass(order.status)}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="order-card-body">
        <div className="order-items-preview">
          {order.items.slice(0, 2).map(item => (
            <div key={item.id} className="preview-item">
              <span>{item.name} x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="preview-more">
              +{order.items.length - 2} món khác
            </div>
          )}
        </div>

        <div className="order-card-footer">
          <span className="order-total">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(order.total)}
          </span>
          <span className="order-time">{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderCard



