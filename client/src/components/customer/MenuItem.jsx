import React from 'react'
import './MenuItem.css'

const getImageUrl = (imagePath, fallbackText) => {
  if (!imagePath) {
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(fallbackText)}`
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  if (imagePath.startsWith('/uploads/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    return `${baseURL}${imagePath}`
  }

  return imagePath
}

const MenuItem = ({ item, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(item)
  }

  return (
    <div className="menu-item card">
      <div className="menu-item-image">
        <img 
          src={getImageUrl(item.image, item.name)} 
          alt={item.name}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(item.name)}`
          }}
        />
      </div>
      <div className="menu-item-content">
        <h3 className="menu-item-name">{item.name}</h3>
        {item.description && (
          <p className="menu-item-description">{item.description}</p>
        )}
        <div className="menu-item-footer">
          <span className="menu-item-price">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(item.price)}
          </span>
          <button 
            className="btn btn-primary btn-add-to-cart"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuItem



