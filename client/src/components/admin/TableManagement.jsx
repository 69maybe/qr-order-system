import React, { useState, useEffect } from 'react'
import TableForm from './TableForm'
import api from '../../services/api'
import './TableManagement.css'

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

const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await api.get('/api/tables')
      setTables(response.data)
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedTable(null)
    setShowForm(true)
  }

  const handleEdit = (table) => {
    setSelectedTable(table)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bàn ăn này?')) {
      return
    }

    try {
      await api.delete(`/api/tables/${id}`)
      setTables(tables.filter(table => table.id !== id))
      alert('Đã xóa bàn ăn thành công')
    } catch (error) {
      console.error('Error deleting table:', error)
      alert('Có lỗi xảy ra khi xóa bàn ăn')
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTable) {
        const updateData = {
          code: formData.code,
          status: formData.status
        }
        // Không gửi qrCode, backend sẽ tự động tạo lại nếu mã bàn thay đổi
        
        await api.put(`/api/tables/${selectedTable.id}`, updateData)
        await fetchTables()
        alert('Đã cập nhật bàn ăn thành công')
      } else {
        // Khi thêm mới, không gửi qrCode (sẽ tự động tạo)
        await api.post('/api/tables', {
          code: formData.code,
          status: formData.status
        })
        await fetchTables()
        alert('Đã thêm bàn ăn thành công. QR Code đã được tự động tạo!')
      }
      
      setShowForm(false)
      setSelectedTable(null)
    } catch (error) {
      console.error('Error saving table:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu bàn ăn'
      alert(`Lỗi: ${errorMessage}`)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedTable(null)
  }

  const getStatusText = (status) => {
    const statusMap = {
      'trong': 'Trống',
      'co_nguoi': 'Đang sử dụng'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    return `badge badge-${status === 'trong' ? 'success' : 'pending'}`
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="table-management">
      <div className="management-header">
        <h2>Quản lý Bàn ăn</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Thêm bàn ăn
        </button>
      </div>

      {showForm && (
        <TableForm
          table={selectedTable}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      <div className="tables-grid">
        {tables.map(table => (
          <div key={table.id} className="table-card card">
            <div className="table-card-header">
              <h3>Bàn {table.code}</h3>
              <span className={getStatusClass(table.status)}>
                {getStatusText(table.status)}
              </span>
            </div>
            <div className="table-card-body">
              <div className="table-info">
                <span className="info-label">QR Code:</span>
                {table.qrCode ? (
                  <div style={{ marginTop: '8px' }}>
                    <img 
                      src={getImageUrl(table.qrCode)} 
                      alt={`QR Code bàn ${table.code}`}
                      style={{ 
                        maxWidth: '100px', 
                        maxHeight: '100px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                ) : (
                  <span className="info-value">Chưa có</span>
                )}
              </div>
            </div>
            <div className="table-card-actions">
              <button
                className="btn-edit"
                onClick={() => handleEdit(table)}
              >
                Sửa
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(table.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="empty-message card">
          Chưa có bàn ăn nào. Hãy thêm bàn ăn mới.
        </div>
      )}
    </div>
  )
}

export default TableManagement



