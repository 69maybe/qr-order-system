const pool = require('../config/db')

const ORDER_STATUSES = ['cho_xu_ly', 'dang_chuan_bi', 'da_phuc_vu', 'huy']

const mapOrder = (row) => ({
  id: row.id,
  tableId: row.ban_id,
  tableCode: row.ma_ban,
  status: row.trang_thai,
  totalAmount: Number(row.tong_tien),
  isPaid: Boolean(row.da_thanh_toan),
  createdAt: row.ngay_tao
})

const attachItemsToOrders = (orders, items) => {
  const itemMap = orders.reduce((acc, order) => {
    acc[order.id] = []
    return acc
  }, {})

  items.forEach(item => {
    if (itemMap[item.don_hang_id]) {
      itemMap[item.don_hang_id].push({
        id: item.id,
        menuItemId: item.mon_an_id,
        name: item.ten_mon,
        price: Number(item.gia),
        quantity: item.so_luong
      })
    }
  })

  return orders.map(order => ({
    ...order,
    items: itemMap[order.id] || []
  }))
}

exports.listOrders = async (req, res, next) => {
  try {
    const { status } = req.query

    const filters = []
    const values = []
    if (status) {
      filters.push('dh.trang_thai = ?')
      values.push(status)
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const [orderRows] = await pool.query(
      `SELECT dh.*, ba.ma_ban 
       FROM don_hang dh
       LEFT JOIN ban_an ba ON dh.ban_id = ba.id
       ${whereClause}
       ORDER BY dh.ngay_tao DESC`,
      values
    )

    if (orderRows.length === 0) {
      return res.json([])
    }

    const orderIds = orderRows.map(row => row.id)
    const [itemRows] = await pool.query(
      `SELECT ct.*, ma.ten_mon, ma.gia 
       FROM chi_tiet_don_hang ct
       JOIN mon_an ma ON ct.mon_an_id = ma.id
       WHERE ct.don_hang_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds
    )

    const mappedOrders = attachItemsToOrders(orderRows.map(mapOrder), itemRows)
    res.json(mappedOrders)
  } catch (error) {
    next(error)
  }
}

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params

    const [orderRows] = await pool.query(
      `SELECT dh.*, ba.ma_ban 
       FROM don_hang dh
       LEFT JOIN ban_an ba ON dh.ban_id = ba.id
       WHERE dh.id = ?`,
      [id]
    )

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    const [itemRows] = await pool.query(
      `SELECT ct.*, ma.ten_mon, ma.gia 
       FROM chi_tiet_don_hang ct
       JOIN mon_an ma ON ct.mon_an_id = ma.id
       WHERE ct.don_hang_id = ?`,
      [id]
    )

    const [order] = attachItemsToOrders(orderRows.map(mapOrder), itemRows)
    res.json(order)
  } catch (error) {
    next(error)
  }
}

exports.createOrder = async (req, res, next) => {
  let connection
  try {
    const { tableId, tableCode, items } = req.body

    if ((!tableId && !tableCode) || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin bàn hoặc danh sách món ăn' })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    let tableQuery = 'SELECT * FROM ban_an WHERE '
    const tableValues = []

    if (tableId) {
      tableQuery += 'id = ?'
      tableValues.push(tableId)
    } else {
      tableQuery += 'ma_ban = ?'
      tableValues.push(tableCode)
    }

    const [tables] = await connection.query(tableQuery + ' LIMIT 1', tableValues)
    if (tables.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Không tìm thấy bàn ăn' })
    }

    const table = tables[0]
    const menuIds = items.map(item => item.menuItemId)

    const [menuRows] = await connection.query(
      `SELECT id, ten_mon, gia FROM mon_an WHERE id IN (${menuIds.map(() => '?').join(',')})`,
      menuIds
    )

    const menuMap = new Map(menuRows.map(row => [row.id, row]))

    const normalizedItems = items.map(item => {
      const menu = menuMap.get(item.menuItemId)
      if (!menu) {
        throw Object.assign(new Error('Món ăn không tồn tại'), { status: 400 })
      }
      const quantity = Number(item.quantity) || 1
      return {
        menuId: menu.id,
        name: menu.ten_mon,
        price: Number(menu.gia),
        quantity
      }
    })

    const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const [orderResult] = await connection.query(
      'INSERT INTO don_hang (ban_id, trang_thai, tong_tien) VALUES (?, ?, ?)',
      [table.id, 'cho_xu_ly', total]
    )

    const orderId = orderResult.insertId

    await Promise.all(
      normalizedItems.map(item =>
        connection.query(
          'INSERT INTO chi_tiet_don_hang (don_hang_id, mon_an_id, so_luong) VALUES (?, ?, ?)',
          [orderId, item.menuId, item.quantity]
        )
      )
    )

    await connection.query(
      'UPDATE ban_an SET trang_thai = ? WHERE id = ?',
      ['co_nguoi', table.id]
    )

    await connection.commit()

    res.status(201).json({
      id: orderId,
      tableId: table.id,
      tableCode: table.ma_ban,
      status: 'cho_xu_ly',
      totalAmount: total,
      items: normalizedItems,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    next(error)
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
    }

    const [result] = await pool.query(
      'UPDATE don_hang SET trang_thai = ? WHERE id = ?',
      [status, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    res.json({ message: 'Cập nhật trạng thái thành công' })
  } catch (error) {
    next(error)
  }
}

exports.markOrderPayment = async (req, res, next) => {
  let connection
  try {
    const { id } = req.params
    const { isPaid = true } = req.body

    connection = await pool.getConnection()
    await connection.beginTransaction()

    const [orderRows] = await connection.query(
      'SELECT * FROM don_hang WHERE id = ?',
      [id]
    )

    if (orderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    const order = orderRows[0]

    if (isPaid && order.trang_thai !== 'da_phuc_vu') {
      await connection.rollback()
      return res.status(400).json({ 
        message: 'Chỉ có thể thanh toán khi đơn hàng đã được phục vụ' 
      })
    }

    await connection.query(
      'UPDATE don_hang SET da_thanh_toan = ? WHERE id = ?',
      [isPaid ? 1 : 0, id]
    )

    if (isPaid && order.ban_id) {
      await connection.query(
        'UPDATE ban_an SET trang_thai = ? WHERE id = ?',
        ['trong', order.ban_id]
      )
    }

    await connection.commit()
    res.json({ message: 'Cập nhật thanh toán thành công' })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    next(error)
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

exports.getRevenueStatistics = async (req, res, next) => {
  try {
    const { filterType = 'day', startDate, endDate } = req.query

    let query
    let values = []

    if (filterType === 'day') {
      const start = startDate ? new Date(startDate) : new Date()
      start.setHours(0, 0, 0, 0)
      const end = endDate ? new Date(endDate) : new Date()
      end.setHours(23, 59, 59, 999)

      query = `
        SELECT 
          DATE(dh.ngay_tao) as date,
          COALESCE(SUM(CASE WHEN dh.da_thanh_toan = 1 THEN dh.tong_tien ELSE 0 END), 0) as revenue,
          COUNT(CASE WHEN dh.da_thanh_toan = 1 THEN 1 END) as orders
        FROM don_hang dh
        WHERE dh.ngay_tao >= ? AND dh.ngay_tao <= ?
        GROUP BY DATE(dh.ngay_tao)
        ORDER BY DATE(dh.ngay_tao) ASC
      `
      values = [start, end]
    } else {
      query = `
        SELECT 
          DATE_FORMAT(dh.ngay_tao, '%Y-%m') as month_key,
          CONCAT('Tháng ', MONTH(dh.ngay_tao)) as month,
          COALESCE(SUM(CASE WHEN dh.da_thanh_toan = 1 THEN dh.tong_tien ELSE 0 END), 0) as revenue,
          COUNT(CASE WHEN dh.da_thanh_toan = 1 THEN 1 END) as orders
        FROM don_hang dh
        WHERE dh.ngay_tao >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(dh.ngay_tao, '%Y-%m'), MONTH(dh.ngay_tao)
        ORDER BY month_key ASC
      `
    }

    const [rows] = await pool.query(query, values)

    const result = rows.map(row => {
      const baseData = {
        revenue: Number(row.revenue) || 0,
        orders: Number(row.orders) || 0
      }

      if (filterType === 'day') {
        if (row.date) {
          const dateValue = row.date instanceof Date 
            ? row.date.toISOString().split('T')[0]
            : row.date.toString().split('T')[0]
          return { date: dateValue, ...baseData }
        }
        return { date: '', ...baseData }
      } else {
        return { month: row.month || '', ...baseData }
      }
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
}

