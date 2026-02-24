const pool = require('../config/db')
const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs')

const mapTable = (row) => ({
  id: row.id,
  code: row.ma_ban,
  qrCode: row.qr_code,
  status: row.trang_thai
})

// Tạo QR code cho bàn
const generateQRCode = async (tableCode) => {
  try {
    // Đảm bảo thư mục tồn tại
    const qrcodeDir = path.join(__dirname, '../../uploads/qrcodes')
    if (!fs.existsSync(qrcodeDir)) {
      fs.mkdirSync(qrcodeDir, { recursive: true })
      console.log(`📁 Đã tạo thư mục: ${qrcodeDir}`)
    }

    const baseUrl = process.env.CLIENT_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
    const orderUrl = `${baseUrl}/order/${tableCode}`

    // Tạo tên file cho QR code (sử dụng mã bàn + timestamp)
    const filename = `qrcode-${tableCode}-${Date.now()}.png`
    const filepath = path.join(qrcodeDir, filename)

    // Tạo QR code và lưu vào file
    await QRCode.toFile(filepath, orderUrl, {
      errorCorrectionLevel: 'H', // Mức độ sửa lỗi cao nhất
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    })

    console.log(`✅ Đã tạo QR code cho bàn ${tableCode}: ${filename}`)
    console.log(`   URL: ${orderUrl}`)
    console.log(`   File: ${filepath}`)

    // Trả về đường dẫn URL để lưu vào database
    return `/uploads/qrcodes/${filename}`
  } catch (error) {
    console.error('❌ Lỗi khi tạo QR code:', error)
    throw error
  }
}

exports.getTables = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ban_an ORDER BY id ASC')
    res.json(rows.map(mapTable))
  } catch (error) {
    next(error)
  }
}

exports.createTable = async (req, res, next) => {
  try {
    const { code, qrCode, status = 'trong' } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã bàn' })
    }

    // LUÔN TỰ ĐỘNG TẠO QR CODE từ URL đặt hàng
    // Tạo URL: http://localhost:3000/order/{mã_bàn}
    // Lưu file QR code vào folder: server/uploads/qrcodes/
    // Lưu đường dẫn file vào cột qr_code trong bảng ban_an
    let finalQRCode = null
    if (qrCode && qrCode.trim() !== '') {
      // Nếu có QR code được cung cấp, sử dụng nó
      finalQRCode = qrCode
    } else {
      // Nếu không có, tự động tạo QR code từ mã bàn
      try {
        finalQRCode = await generateQRCode(code)
        console.log(`📋 Đã lưu đường dẫn QR code vào database: ${finalQRCode}`)
      } catch (qrError) {
        console.error('❌ Lỗi khi tạo QR code, tiếp tục tạo bàn không có QR code:', qrError)
        // Tiếp tục tạo bàn mà không có QR code nếu có lỗi
        finalQRCode = null
      }
    }

    // Lưu vào database: ma_ban, qr_code (đường dẫn file), trang_thai
    const [result] = await pool.query(
      'INSERT INTO ban_an (ma_ban, qr_code, trang_thai) VALUES (?, ?, ?)',
      [code, finalQRCode, status]
    )

    res.status(201).json({
      id: result.insertId,
      code,
      qrCode: finalQRCode, // Đường dẫn file QR code: /uploads/qrcodes/qrcode-{code}-{timestamp}.png
      status
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 400
      error.message = 'Mã bàn đã tồn tại'
    }
    next(error)
  }
}

exports.updateTable = async (req, res, next) => {
  try {
    const { id } = req.params
    const { code, qrCode, status } = req.body

    const [rows] = await pool.query('SELECT * FROM ban_an WHERE id = ? LIMIT 1', [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bàn ăn' })
    }

    const existingTable = rows[0]
    const newTableCode = code ?? existingTable.ma_ban
    const tableCodeChanged = code && code !== existingTable.ma_ban

    // Xử lý QR code
    let finalQRCode = existingTable.qr_code // Mặc định giữ nguyên QR code cũ

    // Nếu mã bàn thay đổi, tự động tạo QR code mới
    if (tableCodeChanged) {
      try {
        finalQRCode = await generateQRCode(newTableCode)
        console.log(`🔄 Đã tạo QR code mới cho bàn ${newTableCode} do mã bàn thay đổi`)
      } catch (qrError) {
        console.error('❌ Lỗi khi tạo QR code mới, giữ nguyên QR code cũ:', qrError)
        // Giữ nguyên QR code cũ nếu có lỗi
      }
    } else if (typeof qrCode !== 'undefined') {
      // Nếu có QR code được cung cấp (có thể là URL mới hoặc null để xóa)
      if (qrCode && qrCode.trim() !== '') {
        finalQRCode = qrCode
      } else {
        // Nếu qrCode là rỗng, tạo QR code mới từ mã bàn hiện tại
        try {
          finalQRCode = await generateQRCode(newTableCode)
          console.log(`🔄 Đã tạo QR code mới cho bàn ${newTableCode}`)
        } catch (qrError) {
          console.error('❌ Lỗi khi tạo QR code, giữ nguyên QR code cũ:', qrError)
        }
      }
    }

    const payload = {
      ma_ban: newTableCode,
      qr_code: finalQRCode,
      trang_thai: status ?? existingTable.trang_thai
    }

    await pool.query(
      'UPDATE ban_an SET ma_ban = ?, qr_code = ?, trang_thai = ? WHERE id = ?',
      [payload.ma_ban, payload.qr_code, payload.trang_thai, id]
    )

    res.json(mapTable({ id: Number(id), ...payload }))
  } catch (error) {
    next(error)
  }
}

exports.deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params

    const [result] = await pool.query('DELETE FROM ban_an WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bàn ăn' })
    }

    res.json({ message: 'Đã xóa bàn ăn thành công' })
  } catch (error) {
    next(error)
  }
}

