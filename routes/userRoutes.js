const express = require('express')
const router = express.Router()

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController')
const authenticationMiddleware = require('../middleware/authentication')
const authorizeMiddleware = require('../middleware/authorize')
const testUserMiddleware = require('../middleware/testUser')
router.get(
  '/',
  authenticationMiddleware,
  authorizeMiddleware('admin'),
  getAllUsers
)
router.get('/showMe', authenticationMiddleware, showCurrentUser)
router.patch(
  '/updateUser',
  authenticationMiddleware,
  testUserMiddleware,
  updateUser
)
router.patch(
  '/updateUserPassword',
  authenticationMiddleware,
  testUserMiddleware,
  updateUserPassword
)
router.get('/:id', authenticationMiddleware, getSingleUser)

module.exports = router
