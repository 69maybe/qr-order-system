import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './StaffLogin.css'

const StaffLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(formData)

      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/staff/dashboard')
      }

      setLoading(false)
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
      setLoading(false)
    }
  }

  return (
    <div className="staff-login">
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <h1>Đăng nhập nhân viên</h1>
            <p>Nhập thông tin đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="login-footer">
            <p className="demo-info">
              <strong>Hướng dẫn đăng nhập:</strong>
              <br />
              • <strong>Admin:</strong> Username = "admin" (123)
              <br />
              • <strong>Nhân viên:</strong> nhanvien1 (123)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin
