import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns'
import api from '../../services/api'
import './RevenueStatistics.css'

const RevenueStatistics = () => {
  const [revenueData, setRevenueData] = useState([])
  const [filterType, setFilterType] = useState('day') // 'day' or 'month'
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [filterType, dateRange])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const params = {
        filterType,
        ...(filterType === 'day' && {
          startDate: dateRange.start,
          endDate: dateRange.end
        })
      }
      
      const response = await api.get('/api/orders/revenue/statistics', { params })
      setRevenueData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      setRevenueData([])
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return revenueData.reduce((sum, item) => sum + item.revenue, 0)
  }

  const calculateAverage = () => {
    if (revenueData.length === 0) return 0
    return calculateTotal() / revenueData.length
  }

  const calculateTotalOrders = () => {
    return revenueData.reduce((sum, item) => sum + item.orders, 0)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="revenue-statistics">
      <div className="statistics-header">
        <h2>Thống kê Doanh thu</h2>
        
        <div className="filter-controls">
          <div className="filter-type">
            <button
              className={`filter-btn ${filterType === 'day' ? 'active' : ''}`}
              onClick={() => setFilterType('day')}
            >
              Theo ngày
            </button>
            <button
              className={`filter-btn ${filterType === 'month' ? 'active' : ''}`}
              onClick={() => setFilterType('month')}
            >
              Theo tháng
            </button>
          </div>

          {filterType === 'day' && (
            <div className="date-range">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span>đến</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="statistics-summary">
        <div className="summary-card card">
          <h3>Tổng doanh thu</h3>
          <p className="summary-value">{formatCurrency(calculateTotal())}</p>
        </div>
        <div className="summary-card card">
          <h3>Doanh thu trung bình</h3>
          <p className="summary-value">{formatCurrency(calculateAverage())}</p>
        </div>
        <div className="summary-card card">
          <h3>Tổng số đơn hàng</h3>
          <p className="summary-value">{calculateTotalOrders()}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card card">
          <h3>Biểu đồ Doanh thu</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={filterType === 'day' ? 'date' : 'month'}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Thời gian: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb"
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card card">
          <h3>Biểu đồ Số lượng Đơn hàng</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={filterType === 'day' ? 'date' : 'month'}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => `Thời gian: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="orders" 
                fill="#f59e0b"
                name="Số đơn hàng"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="revenue-table card">
        <h3>Bảng dữ liệu chi tiết</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>{filterType === 'day' ? 'Ngày' : 'Tháng'}</th>
              <th>Doanh thu</th>
              <th>Số đơn hàng</th>
              <th>Doanh thu trung bình/đơn</th>
            </tr>
          </thead>
          <tbody>
            {revenueData.map((item, index) => (
              <tr key={index}>
                <td>{filterType === 'day' ? item.date : item.month}</td>
                <td className="revenue-value">{formatCurrency(item.revenue)}</td>
                <td>{item.orders}</td>
                <td>{item.orders > 0 ? formatCurrency(item.revenue / item.orders) : formatCurrency(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RevenueStatistics
