const mysql = require('mysql2/promise')

// Hỗ trợ cả DB_* (local) và MYSQL* (Railway MySQL plugin)
const {
  DB_HOST = process.env.MYSQLHOST || '127.0.0.1',
  DB_PORT = process.env.MYSQLPORT || 3306,
  DB_USER = process.env.MYSQLUSER || 'root',
  DB_PASSWORD = process.env.MYSQLPASSWORD || '',
  DB_NAME = process.env.MYSQLDATABASE || 'qr_order_system'
} = process.env

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool

