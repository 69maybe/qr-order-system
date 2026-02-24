import React from 'react'
import './OrderCart.css'

const OrderCart = ({ cart, onRemove, onUpdateQuantity, total, onSubmitOrder }) => {
  return (
    <div className="order-cart card">
      <h2>Giỏ hàng</h2>
      
      {cart.length === 0 ? (
        <p className="empty-cart">Giỏ hàng trống</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <span className="cart-item-price">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.price)}
                  </span>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="btn-quantity"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="btn-quantity"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="btn-remove"
                    onClick={() => onRemove(item.id)}
                  >
                    Xóa
                  </button>
                </div>
                <div className="cart-item-total">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="cart-total">
              <span>Tổng cộng:</span>
              <span className="total-amount">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(total)}
              </span>
            </div>
            <button
              className="btn btn-primary btn-submit-order"
              onClick={onSubmitOrder}
            >
              Gửi đơn hàng
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderCart



