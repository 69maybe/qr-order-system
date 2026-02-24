import React, { useState, useEffect } from 'react'
import MenuForm from './MenuForm'
import api from '../../services/api'
import './MenuManagement.css'

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  // Nếu đã là full URL, trả về nguyên
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // Nếu là relative path từ server, thêm base URL
  if (imagePath.startsWith('/uploads/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    return `${baseURL}${imagePath}`
  }
  return imagePath
}

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/api/menu')
      setMenuItems(response.data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedItem(null)
    setShowForm(true)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setShowForm(true)
  }

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'inactive' ? 'vô hiệu hóa' : 'kích hoạt'
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} món ăn "${item.name}"?`)) {
      return
    }

    try {
      await api.put(`/api/menu/${item.id}`, { status: newStatus })
      await fetchMenuItems()
      alert(`Đã ${action} món ăn thành công`)
    } catch (error) {
      console.error('Error toggling menu item status:', error)
      const errorMessage = error.response?.data?.message || error.message || `Có lỗi xảy ra khi ${action} món ăn`
      alert(`Lỗi: ${errorMessage}`)
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      let dataToSend
      
      // Nếu có file upload, sử dụng FormData
      if (formData.imageFile) {
        dataToSend = new FormData()
        dataToSend.append('name', formData.name)
        dataToSend.append('description', formData.description || '')
        dataToSend.append('price', formData.price)
        dataToSend.append('image', formData.imageFile)
      } else {
        // Nếu không có file, gửi JSON bình thường
        dataToSend = {
          name: formData.name,
          description: formData.description || '',
          price: formData.price,
          image: formData.image || null
        }
      }

      if (selectedItem) {
        await api.put(`/api/menu/${selectedItem.id}`, dataToSend)
        await fetchMenuItems()
        alert('Đã cập nhật món ăn thành công')
      } else {
        await api.post('/api/menu', dataToSend)
        await fetchMenuItems()
        alert('Đã thêm món ăn thành công')
      }
      
      setShowForm(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error saving menu item:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu món ăn'
      alert(`Lỗi: ${errorMessage}`)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedItem(null)
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="menu-management">
      <div className="management-header">
        <h2>Quản lý Menu</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Thêm món ăn
        </button>
      </div>

      {showForm && (
        <MenuForm
          item={selectedItem}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      <div className="menu-table card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên món</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Hình ảnh</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-message">
                  Chưa có món ăn nào. Hãy thêm món ăn mới.
                </td>
              </tr>
            ) : (
              menuItems.map(item => (
                <tr key={item.id} className={item.status === 'inactive' ? 'inactive-row' : ''}>
                  <td>{item.id}</td>
                  <td className="item-name">{item.name}</td>
                  <td className="item-description">{item.description || '-'}</td>
                  <td className="item-price">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.price)}
                  </td>
                  <td>
                    {item.image ? (
                      <img src={getImageUrl(item.image)} alt={item.name} className="item-image" />
                    ) : (
                      <span className="no-image">Chưa có ảnh</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(item)}
                    >
                      Sửa
                    </button>
                    <button
                      className={item.status === 'active' ? 'btn-inactive' : 'btn-active'}
                      onClick={() => handleToggleStatus(item)}
                    >
                      {item.status === 'active' ? 'Inactive' : 'Active'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MenuManagement



