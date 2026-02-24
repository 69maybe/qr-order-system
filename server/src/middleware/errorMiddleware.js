const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn: ${req.originalUrl}`)
  error.status = 404
  next(error)
}

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500
  const message = err.message || 'Đã xảy ra lỗi không xác định'

  if (process.env.NODE_ENV !== 'production') {
    console.error(err) // eslint-disable-line no-console
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
}

module.exports = {
  notFound,
  errorHandler
}

