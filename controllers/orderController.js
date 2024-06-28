const { StatusCodes } = require('http-status-codes')
const Order = require('../models/Order')
const Product = require('../models/Product')
const { checkPermissions } = require('../utils')
const { BadRequestError, NotFoundError } = require('../errors')
const moment = require('moment')
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY)

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No cart items provided')
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError('Please provide tax and shipping fee')
  }

  let orderItems = []
  let subtotal = 0

  for (const item of cartItems) {
    const productId = item.id.split('#')

    const dbProduct = await Product.findOne({ _id: productId[0] })
    if (!dbProduct) {
      throw new NotFoundError(`No product with id : ${item.product}`)
    }

    const { name, price, image, _id } = dbProduct
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      color: productId[1],
      product: _id,
    }
    // add item to order
    orderItems = [...orderItems, singleOrderItem]
    // calculate subtotal
    subtotal += item.amount * price
  }

  const total = tax + shippingFee + subtotal

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'cad',
  })

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  })

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res
    .status(StatusCodes.OK)
    .json({ orders: orders.reverse(), count: orders.length })
}

const showOrderStats = async (req, res) => {
  let orderStats = await Order.aggregate([
    {
      $match: {
        createdBy: null,
      },
    },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  let monthlyOrder = await Order.aggregate([
    { $match: { createdBy: null } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ])

  monthlyOrder = monthlyOrder
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y')
      return { date, count }
    })
    .reverse()

  let mustOrderStats = await Order.aggregate([
    {
      $unwind: '$orderItems',
    },
    {
      $group: {
        _id: '$orderItems.name',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ])

  res.status(StatusCodes.OK).json({
    orderState: orderStats,
    monthlyOrder,
    mustOrderStats,
  })
}

const getSingleOrders = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findOne({ _id: orderId })

  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`)
  }

  checkPermissions(req.user, order.user)
  res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params
  const { paymentIntentId, address } = req.body

  const order = await Order.findOne({ _id: orderId })
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`)
  }

  checkPermissions(req.user, order.user)
  order.paymentIntentId = paymentIntentId
  order.status = 'paid'
  order.shippingAddress = address
  await order.save()
  res.status(StatusCodes.OK).json({ order })
}

const completeOrder = async (req, res) => {
  const { id: orderId } = req.params
  const { status } = req.body

  if (!status) {
    throw new BadRequestError('Please provide status')
  }

  const order = await Order.findOne({ _id: orderId })
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`)
  }

  order.status = status
  await order.save()
  res.status(StatusCodes.OK).json({ order })
}

const getSingleUserOrder = async (req, res) => {
  const { id: userId } = req.params
  const order = await Order.find({ user: userId })
  res.status(StatusCodes.OK).json({ order })
}

module.exports = {
  getAllOrders,
  getSingleOrders,
  getSingleUserOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  showOrderStats,
  completeOrder,
}
