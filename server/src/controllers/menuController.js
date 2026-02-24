const pool = require('../config/db')

const mapMenuItem = (row) => ({
  id: row.id,
  name: row.ten_mon,
  description: row.mo_ta,
  price: Number(row.gia),
  image: row.hinh_anh,
  status: row.status || 'active',
  category: row.loai_mon
})

exports.getMenuItems = async (req, res, next) => {
  try {
    // Nếu là request từ khách hàng (không có auth), chỉ lấy món active
    // Nếu là admin/staff (có auth), lấy tất cả
    const isAuthenticated = req.user && (req.user.role === 'admin' || req.user.role === 'staff')
    const query = isAuthenticated 
      ? 'SELECT * FROM mon_an ORDER BY id DESC'
      : "SELECT * FROM mon_an WHERE status = 'active' ORDER BY id DESC"
    
    const [rows] = await pool.query(query)
    res.json(rows.map(mapMenuItem))
  } catch (error) {
    next(error)
  }
}

exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, image, isActive = true, category = null } = req.body

    if (!name || typeof price === 'undefined') {
      return res.status(400).json({ message: 'Tên món ăn và giá là bắt buộc' })
    }

    // Parse price thành number (có thể là string từ FormData)
    const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price)
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: 'Giá không hợp lệ' })
    }

    // Xử lý file upload hoặc URL
    let imageUrl = image || null
    if (req.file) {
      // Nếu có file upload, sử dụng đường dẫn từ file
      imageUrl = `/uploads/menu/${req.file.filename}`
    }

    const status = 'active' // Món mới tạo mặc định là active

    const [result] = await pool.query(
      'INSERT INTO mon_an (ten_mon, mo_ta, gia, hinh_anh, loai_mon, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, priceNum, imageUrl, category, status]
    )

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      price: priceNum,
      image: imageUrl,
      status,
      category
    })
  } catch (error) {
    next(error)
  }
}

exports.updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, price, image, isActive, category, status } = req.body

    const [existingRows] = await pool.query('SELECT * FROM mon_an WHERE id = ? LIMIT 1', [id])
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' })
    }

    // Nếu đang set status thành 'inactive', kiểm tra xem món có trong đơn hàng chưa thanh toán không
    if (status === 'inactive' && existingRows[0].status !== 'inactive') {
      const [unpaidOrders] = await pool.query(
        `SELECT COUNT(DISTINCT ct.don_hang_id) as count
         FROM chi_tiet_don_hang ct
         JOIN don_hang dh ON ct.don_hang_id = dh.id
         WHERE ct.mon_an_id = ? AND dh.da_thanh_toan = 0`,
        [id]
      )

      if (unpaidOrders[0].count > 0) {
        return res.status(400).json({ 
          message: `Không thể vô hiệu hóa món ăn này vì món đang nằm trong ${unpaidOrders[0].count} đơn hàng chưa thanh toán. Vui lòng đợi các đơn hàng được thanh toán trước.` 
        })
      }
    }

    // Xử lý file upload hoặc URL
    let imageUrl = existingRows[0].hinh_anh
    if (req.file) {
      // Nếu có file upload mới, sử dụng đường dẫn từ file
      imageUrl = `/uploads/menu/${req.file.filename}`
    } else if (typeof image !== 'undefined') {
      // Nếu có URL mới (hoặc null để xóa ảnh)
      imageUrl = image || null
    }

    // Parse price nếu có (có thể là string từ FormData)
    let priceValue = existingRows[0].gia
    if (typeof price !== 'undefined') {
      priceValue = typeof price === 'string' ? parseFloat(price) : Number(price)
      if (isNaN(priceValue) || priceValue < 0) {
        return res.status(400).json({ message: 'Giá không hợp lệ' })
      }
    }

    const payload = {
      ten_mon: name ?? existingRows[0].ten_mon,
      mo_ta: typeof description === 'undefined' ? existingRows[0].mo_ta : description,
      gia: priceValue,
      hinh_anh: imageUrl,
      loai_mon: typeof category === 'undefined' ? existingRows[0].loai_mon : category,
      status: typeof status === 'undefined' ? (existingRows[0].status || 'active') : status
    }

    await pool.query(
      `UPDATE mon_an 
       SET ten_mon = ?, mo_ta = ?, gia = ?, hinh_anh = ?, loai_mon = ?, status = ? 
       WHERE id = ?`,
      [payload.ten_mon, payload.mo_ta, payload.gia, payload.hinh_anh, payload.loai_mon, payload.status, id]
    )

    res.json(mapMenuItem({ id: Number(id), ...payload }))
  } catch (error) {
    next(error)
  }
}

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params

    // Kiểm tra xem món ăn có tồn tại không
    const [existingRows] = await pool.query('SELECT * FROM mon_an WHERE id = ? LIMIT 1', [id])
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' })
    }

    // Kiểm tra xem món có trong đơn hàng chưa thanh toán không
    const [unpaidOrders] = await pool.query(
      `SELECT COUNT(DISTINCT ct.don_hang_id) as count
       FROM chi_tiet_don_hang ct
       JOIN don_hang dh ON ct.don_hang_id = dh.id
       WHERE ct.mon_an_id = ? AND dh.da_thanh_toan = 0`,
      [id]
    )

    if (unpaidOrders[0].count > 0) {
      return res.status(400).json({ 
        message: `Không thể vô hiệu hóa món ăn này vì món đang nằm trong ${unpaidOrders[0].count} đơn hàng chưa thanh toán. Vui lòng đợi các đơn hàng được thanh toán trước.` 
      })
    }

    // Thay vì xóa, set status thành 'inactive'
    const [result] = await pool.query(
      "UPDATE mon_an SET status = 'inactive' WHERE id = ?",
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' })
    }

    res.json({ message: 'Đã vô hiệu hóa món ăn thành công' })
  } catch (error) {
    next(error)
  }
}

