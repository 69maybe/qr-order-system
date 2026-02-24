import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Nếu là FormData, để browser tự động set Content-Type với boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

export default api

