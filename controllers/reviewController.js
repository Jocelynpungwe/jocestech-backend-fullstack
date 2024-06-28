const { StatusCodes } = require('http-status-codes')
const Review = require('../models/Review')
const { NotFoundError, BadRequestError } = require('../errors')
const { checkPermissions } = require('../utils')
const Product = require('../models/Product')

const createReview = async (req, res) => {
  const { product: productId } = req.body
  req.body.user = req.user.userId

  const isValidProduct = await Product.findOne({ _id: productId })

  if (!isValidProduct) {
    throw new NotFoundError(`No product with id : ${productId}`)
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  })

  if (alreadySubmitted) {
    throw new BadRequestError('Already submitted review for this product')
  }

  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  const { page: pageNo } = req.query
  const page = Number(pageNo) || 1
  const limit = Number(req.params.limit) || 15
  const skip = (page - 1) * limit

  const reviews = await Review.find({})
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'product',
      select: 'name company price image',
    })
    .populate({
      path: 'user',
      select: 'name',
    })

  const totalReviews = await Review.countDocuments({})
  const numOfPages = Math.ceil(totalReviews / limit)

  res
    .status(StatusCodes.OK)
    .json({ reviews, count: reviews.length, numOfPages })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params

  const review = await Review.findOne({ _id: reviewId })
    .populate({
      path: 'product',
      select: 'name company price image',
    })
    .populate({
      path: 'user',
      select: 'name',
    })

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`)
  }

  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const { rating, title, comment } = req.body

  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`)
  }

  checkPermissions(req.user, review.user)

  review.rating = rating
  review.title = title
  review.comment = comment

  await review.save()
  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`)
  }

  checkPermissions(req.user, review.user)
  await review.deleteOne()
  //  re-fix the functionality later

  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' })
}

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const { page: pageNo } = req.query
  const queryObject = { product: productId }

  const page = Number(pageNo) || 1
  const limit = Number(req.params.limit) || 5
  const skip = (page - 1) * limit

  const reviews = await Review.find(queryObject)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'user',
      select: 'name',
    })

  const totalReviews = await Review.countDocuments(queryObject)
  const numOfPages = Math.ceil(totalReviews / limit)

  res.status(StatusCodes.OK).json({ reviews, count: totalReviews, numOfPages })
}

const getSingleUserReview = async (req, res) => {
  const { id: userId } = req.params
  const reviews = await Review.find({ user: userId }).populate({
    path: 'product',
    select: 'name price image',
  })
  res.status(StatusCodes.OK).json({ reviews })
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
  getSingleUserReview,
}
