const router = require('express').Router()
const {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  markOrderPayment,
  getRevenueStatistics
} = require('../controllers/orderController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

router.get('/', authenticate, authorize('admin', 'staff'), listOrders)
router.get('/revenue/statistics', authenticate, authorize('admin'), getRevenueStatistics)
router.get('/:id', authenticate, authorize('admin', 'staff'), getOrderById)
router.post('/', createOrder)
router.patch('/:id/status', authenticate, authorize('admin', 'staff'), updateOrderStatus)
router.patch('/:id/payment', authenticate, authorize('admin', 'staff'), markOrderPayment)

module.exports = router

