const router = require('express').Router()
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController')
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/authMiddleware')
const { uploadMenuImage } = require('../middleware/uploadMiddleware')

// Sử dụng optionalAuthenticate để kiểm tra token nếu có (cho admin/staff)
// Nhưng không bắt buộc (cho khách hàng)
router.get('/', optionalAuthenticate, getMenuItems)

// Middleware để xử lý cả file upload và JSON body
const handleMenuImageUpload = (req, res, next) => {
  // Kiểm tra nếu request là multipart/form-data (có file upload)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return uploadMenuImage.single('image')(req, res, next)
  }
  // Nếu không phải multipart, bỏ qua multer và tiếp tục
  next()
}

router.post('/', authenticate, authorize('admin'), handleMenuImageUpload, createMenuItem)
router.put('/:id', authenticate, authorize('admin'), handleMenuImageUpload, updateMenuItem)
router.delete('/:id', authenticate, authorize('admin'), deleteMenuItem)

module.exports = router

