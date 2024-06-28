const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require('../errors')

const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params
  const user = await User.findOne({ _id: userId }).select('-password')

  if (!user) {
    throw new NotFoundError(`No user with id : ${userId}`)
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
  const { name, email } = req.body
  const { userId } = req.user

  if (!name || !email) {
    throw new BadRequestError('Please provide all values')
  }

  const user = await User.findByIdAndUpdate({ _id: userId }, req.body, {
    new: true,
    runValidators: true,
  })
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide both values')
  }

  const { userId } = req.user
  const user = await User.findOne({ _id: userId })

  const isMatchPassword = await user.comparePassword(oldPassword)

  if (!isMatchPassword) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  user.password = newPassword
  await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
