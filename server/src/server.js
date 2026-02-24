require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')

const authRoutes = require('./routes/authRoutes')
const menuRoutes = require('./routes/menuRoutes')
const tableRoutes = require('./routes/tableRoutes')
const orderRoutes = require('./routes/orderRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : '*'

app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/orders', orderRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 QR Order API đang chạy tại http://localhost:${PORT}`) // eslint-disable-line no-console
})

