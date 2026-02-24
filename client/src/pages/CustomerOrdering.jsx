import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MenuItem from '../components/customer/MenuItem'
import OrderCart from '../components/customer/OrderCart'
import OrderStatus from '../components/customer/OrderStatus'
import api from '../services/api'
import './CustomerOrdering.css'

const CustomerOrdering = () => {
  const { tableId } = useParams()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [orderStatus, setOrderStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const statusMap = {
    cho_xu_ly: 'pending',
    dang_chuan_bi: 'preparing',
    da_phuc_vu: 'served',
    huy: 'cancelled'
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    if (!orderStatus) return

    const interval = setInterval(() => {
      checkOrderStatus(orderStatus.id)
    }, 5000)

    return () => clearInterval(interval)
  }, [orderStatus])

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/api/menu')
      setMenuItems(response.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkOrderStatus = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`)
      setOrderStatus({
        ...response.data,
        status: statusMap[response.data.status] || response.data.status
      })
    } catch (error) {
      console.error('Error checking order status:', error)
    }
  }

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn món ăn trước khi đặt hàng')
      return
    }

    try {
      const response = await api.post('/api/orders', {
        tableCode: tableId,
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      })

      setOrderStatus({
        ...response.data,
        status: statusMap[response.data.status] || response.data.status
      })
      setCart([])
      alert('Đơn hàng đã được gửi thành công!')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại.')
    }
  }

  if (loading) {
    return (
      <div className="customer-ordering loading">
        <div>Đang tải menu...</div>
      </div>
    )
  }

  return (
    <div className="customer-ordering">
      <header className="customer-header">
        <div className="container">
          <h1>Menu Nhà Hàng</h1>
          <p className="table-info">Bàn {tableId}</p>
        </div>
      </header>

      <div className="customer-content container">
        <div className="menu-section">
          <h2>Danh sách món ăn</h2>
          <div className="menu-grid">
            {menuItems.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <OrderCart
            cart={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            total={calculateTotal()}
            onSubmitOrder={handleSubmitOrder}
          />

          {orderStatus && (
            <OrderStatus order={orderStatus} />
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerOrdering



