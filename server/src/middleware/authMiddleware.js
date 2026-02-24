const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập' })
  }

  if (roles.length === 0 || roles.includes(req.user.role)) {
    return next()
  }

  return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' })
}

// Optional authenticate - kiểm tra token nếu có, nhưng không bắt buộc
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Không có token, tiếp tục mà không set req.user
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    // Token không hợp lệ, tiếp tục mà không set req.user
    next()
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate
}

