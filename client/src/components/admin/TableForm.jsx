import React, { useState, useEffect } from 'react'
import './TableForm.css'

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

const TableForm = ({ table, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    code: '',
    status: 'trong'
  })

  useEffect(() => {
    if (table) {
      setFormData({
        code: table.code || '',
        status: table.status || 'trong'
      })
    } else {
      setFormData({
        code: '',
        status: 'trong'
      })
    }
  }, [table])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.code) {
      alert('Vui lòng nhập mã bàn')
      return
    }

    // Khi thêm mới, không gửi qrCode (sẽ tự động tạo)
    // Khi sửa, không gửi qrCode (sẽ tự động tạo lại nếu mã bàn thay đổi)
    onSubmit({
      code: formData.code,
      qrCode: undefined, // Luôn để backend tự động tạo
      status: formData.status
    })
  }

  return (
    <div className="table-form-overlay">
      <div className="table-form card">
        <div className="form-header">
          <h3>{table ? 'Sửa bàn ăn' : 'Thêm bàn ăn mới'}</h3>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="input-group">
            <label htmlFor="code">
              Mã bàn (ví dụ B01) <span className="required">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="Nhập mã bàn"
            />
          </div>

          {table ? (
            // Khi sửa, hiển thị QR code hiện tại (nếu có)
            <div className="input-group">
              <label htmlFor="qrCode">QR Code</label>
              {table.qrCode && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>QR Code hiện tại:</p>
                  <img 
                    src={getImageUrl(table.qrCode)} 
                    alt="QR Code" 
                    style={{ 
                      maxWidth: '150px', 
                      maxHeight: '150px', 
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              )}
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#fff9e6', 
                borderRadius: '4px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ℹ️ QR Code sẽ được tự động tạo lại khi mã bàn thay đổi
              </div>
            </div>
          ) : (
            // Khi thêm mới, hiển thị thông báo QR code sẽ tự động tạo
            <div className="input-group">
              <label>QR Code</label>
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#f0f8ff', 
                borderRadius: '4px',
                fontSize: '14px',
                color: '#0066cc'
              }}>
                ℹ️ QR Code sẽ được tự động tạo sau khi thêm bàn
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="trong">Trống</option>
              <option value="co_nguoi">Đang sử dụng</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {table ? 'Cập nhật' : 'Thêm bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TableForm



