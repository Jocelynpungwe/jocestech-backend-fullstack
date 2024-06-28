const express = require('express')
const router = express.Router()
const authenticationMiddleware = require('../middleware/authentication')
const authorizeMiddleware = require('../middleware/authorize')

const {
  getAllOrders,
  getSingleOrders,
  getSingleUserOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  showOrderStats,
  completeOrder,
} = require('../controllers/orderController')

router.post('/', authenticationMiddleware, createOrder)
router.get(
  '/',
  authenticationMiddleware,
  authorizeMiddleware('admin'),
  getAllOrders
)
router.get(
  '/user/:id',
  authenticationMiddleware,
  authorizeMiddleware('admin'),
  getSingleUserOrder
)

router.get(
  '/showOrderStat',
  authenticationMiddleware,
  authorizeMiddleware('admin'),
  showOrderStats
)
router.get('/showAllMyOrders', authenticationMiddleware, getCurrentUserOrders)
router.get('/:id', authenticationMiddleware, getSingleOrders)

router.patch('/:id', authenticationMiddleware, updateOrder)
router.patch(
  '/complete/:id',
  authenticationMiddleware,
  authorizeMiddleware('admin'),
  completeOrder
)

module.exports = router
