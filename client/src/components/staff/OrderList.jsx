import React from 'react'
import OrderCard from './OrderCard'
import './OrderList.css'

const OrderList = ({
  orders,
  pendingOrders,
  preparingOrders,
  servedOrders,
  selectedOrder,
  onOrderSelect,
  onStatusUpdate
}) => {
  return (
    <div className="order-list">
      <div className="order-stats">
        <div className="stat-card stat-pending">
          <h3>Chờ xử lý</h3>
          <span className="stat-count">{pendingOrders.length}</span>
        </div>
        <div className="stat-card stat-preparing">
          <h3>Đang chuẩn bị</h3>
          <span className="stat-count">{preparingOrders.length}</span>
        </div>
        <div className="stat-card stat-served">
          <h3>Đã phục vụ</h3>
          <span className="stat-count">{servedOrders.length}</span>
        </div>
      </div>

      <div className="orders-container">
        <h2>Danh sách đơn hàng</h2>
        
        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrder?.id === order.id}
                onClick={() => onOrderSelect(order)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderList



