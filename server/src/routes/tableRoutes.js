const router = require('express').Router()
const {
  getTables,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tableController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

router.get('/', authenticate, authorize('admin', 'staff'), getTables)
router.post('/', authenticate, authorize('admin'), createTable)
router.put('/:id', authenticate, authorize('admin'), updateTable)
router.delete('/:id', authenticate, authorize('admin'), deleteTable)

module.exports = router

