import React from 'react'
import './OrderDetail.css'

const OrderDetail = ({ order, onStatusUpdate, onPaymentUpdate }) => {
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'preparing': 'Đang chuẩn bị',
      'served': 'Đã phục vụ'
    }
    return statusMap[status] || status
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'served'
    }
    return statusFlow[currentStatus]
  }

  const handleStatusUpdate = () => {
    const nextStatus = getNextStatus(order.status)
    if (nextStatus) {
      onStatusUpdate(order.id, nextStatus)
    }
  }

  const getStatusButtonText = () => {
    const buttonTextMap = {
      'pending': 'Bắt đầu chuẩn bị',
      'preparing': 'Đánh dấu đã phục vụ',
      'served': 'Đã hoàn thành'
    }
    return buttonTextMap[order.status] || 'Cập nhật trạng thái'
  }

  return (
    <div className="order-detail card">
      <div className="order-detail-header">
        <h2>Chi tiết đơn hàng</h2>
        <span className={`badge badge-${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="order-detail-body">
        <div className="detail-section">
          <h3>Thông tin đơn hàng</h3>
          <div className="detail-info">
            <div className="info-item">
              <span className="info-label">Mã đơn:</span>
              <span className="info-value">#{order.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Bàn số:</span>
              <span className="info-value">{order.tableId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Thời gian:</span>
              <span className="info-value">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Danh sách món ăn</h3>
          <div className="items-list">
            {order.items.map(item => (
              <div key={item.id} className="detail-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section payment-section">
          <div className="order-total-section">
            <span className="total-label">Tổng cộng:</span>
            <span className="total-amount">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(order.total)}
            </span>
          </div>
          <div className="payment-status">
            <span className="payment-label">Thanh toán:</span>
            <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-pending'}`}>
              {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>
        </div>

        <div className="detail-actions">
          {order.status !== 'served' && (
            <button
              className="btn btn-primary btn-update-status"
              onClick={handleStatusUpdate}
            >
              {getStatusButtonText()}
            </button>
          )}

          {!order.isPaid && order.status === 'served' && (
            <button
              className="btn btn-success"
              onClick={() => onPaymentUpdate(order.id, true)}
            >
              Đánh dấu đã thanh toán
            </button>
          )}
          {!order.isPaid && order.status !== 'served' && (
            <div className="payment-hint">
              <p className="hint-text">Vui lòng đánh dấu "Đã phục vụ" trước khi thanh toán</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetail



