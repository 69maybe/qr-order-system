const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../uploads')
const menuDir = path.join(uploadsDir, 'menu')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(menuDir)) {
  fs.mkdirSync(menuDir, { recursive: true })
}

// Cấu hình storage cho menu images
const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, menuDir)
  },
  filename: (req, file, cb) => {
    // Tạo tên file: menu-timestamp-randomnumber.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `menu-${uniqueSuffix}${ext}`)
  }
})

// File filter - chỉ chấp nhận ảnh
const imageFilter = (req, file, cb) => {
  // Kiểm tra MIME type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp, ...)'), false)
  }
}

// Upload middleware cho menu images
const uploadMenuImage = multer({
  storage: menuStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

module.exports = {
  uploadMenuImage
}
