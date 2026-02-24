const router = require('express').Router()
const { login, getProfile } = require('../controllers/authController')
const { authenticate } = require('../middleware/authMiddleware')

router.post('/login', login)
router.get('/me', authenticate, getProfile)

module.exports = router

