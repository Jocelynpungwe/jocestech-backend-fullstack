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

router.get(
  '/',
  authenticationMiddleware,
  authorizeMiddleware('admin'),
  getAllUsers
)
router.get('/showMe', authenticationMiddleware, showCurrentUser)
router.patch('/updateUser', authenticationMiddleware, updateUser)
router.patch(
  '/updateUserPassword',
  authenticationMiddleware,
  updateUserPassword
)
router.get('/:id', authenticationMiddleware, getSingleUser)

module.exports = router
