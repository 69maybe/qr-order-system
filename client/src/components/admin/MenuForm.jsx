import React, { useState, useEffect } from 'react'
import './MenuForm.css'

const MenuForm = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        image: item.image || ''
      })
      // Hiển thị ảnh hiện tại nếu có
      if (item.image) {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
        const imageUrl = item.image.startsWith('http') 
          ? item.image 
          : item.image.startsWith('/uploads/')
          ? `${baseURL}${item.image}`
          : item.image
        setImagePreview(imageUrl)
      }
    }
  }, [item])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh (jpg, png, gif, webp, ...)')
        e.target.value = ''
        return
      }
      
      // Kiểm tra kích thước file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB')
        e.target.value = ''
        return
      }

      setSelectedFile(file)
      
      // Tạo preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData({
      ...formData,
      image: ''
    })
    // Reset file input
    const fileInput = document.getElementById('imageFile')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price)
    }

    // Nếu có file mới được chọn, thêm vào submitData và xóa image URL
    if (selectedFile) {
      submitData.imageFile = selectedFile
      submitData.image = '' // Xóa image URL khi có file mới
    } else if (item && item.image) {
      // Nếu đang edit và không chọn file mới, giữ nguyên ảnh cũ
      submitData.image = item.image
    }

    onSubmit(submitData)
  }

  return (
    <div className="menu-form-overlay">
      <div className="menu-form card">
        <div className="form-header">
          <h3>{item ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h3>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="input-group">
            <label htmlFor="name">
              Tên món ăn <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên món ăn"
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Nhập mô tả món ăn"
            />
          </div>

          <div className="input-group">
            <label htmlFor="price">
              Giá (VNĐ) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="Nhập giá món ăn"
            />
          </div>

          <div className="input-group">
            <label htmlFor="imageFile">Hình ảnh</label>
            <input
              type="file"
              id="imageFile"
              name="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                >
                  Xóa ảnh
                </button>
              </div>
            )}
            {!imagePreview && item && item.image && (
              <p className="image-note">Ảnh hiện tại sẽ được giữ nguyên nếu không chọn ảnh mới</p>
            )}
            {!imagePreview && !item && (
              <p className="image-note">Chọn ảnh cho món ăn (tối đa 5MB)</p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Cập nhật' : 'Thêm món'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MenuForm



