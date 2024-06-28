const { StatusCodes } = require('http-status-codes')
const {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} = require('../errors')
const User = require('../models/User')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide credentials')
  }

  const emailAlreadyExists = await User.findOne({ email })

  if (emailAlreadyExists) {
    throw new BadRequestError('Email already exists')
  }

  //   first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0
  const role = isFirstAccount ? 'admin' : 'user'

  const user = await User.create({ name, email, password, role })
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.CREATED).json({ user: tokenUser })
}

const loginUser = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const isMatchPassword = await user.comparePassword(password)

  if (!isMatchPassword) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const loginAdmin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  if (user.role === 'user') {
    throw new UnauthorizedError('Not Permmited To Access Route ')
  }

  const isMatchPassword = await user.comparePassword(password)

  if (!isMatchPassword) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logoutUser = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
}
