const express = require('express')
const router = express.Router()

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleUserReview,
} = require('../controllers/reviewController')

const authenticationMiddleware = require('../middleware/authentication')
const authorizePermition = require('../middleware/authorize')
const testUserMiddleware = require('../middleware/testUser')

router.get('/', authenticationMiddleware, getAllReviews)
router.get('/:id', authenticationMiddleware, getSingleReview)
router.get(
  '/user/:id',
  authenticationMiddleware,
  authorizePermition('admin'),
  getSingleUserReview
)
router.post('/', authenticationMiddleware, createReview)
router.patch('/:id', authenticationMiddleware, updateReview)
router.delete(
  '/:id',
  authenticationMiddleware,
  testUserMiddleware,
  deleteReview
)

module.exports = router
