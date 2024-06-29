require('dotenv').config()
require('express-async-errors')

// extra security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// Swagger

const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')

const swaggerDocument = YAML.load('./swagger.yaml')

// express
const express = require('express')
const app = express()

// rest of packages
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')

// database
const connectDB = require('./db/connect')

// routers
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const orderRoutes = require('./routes/orderRoutes')

// middleware
const errorHandlerMiddleware = require('./middleware/error-handler')
const notFoundMiddleware = require('./middleware/not-found')

app.set('trust proxy', 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
)

app.use(express.json())
app.use(helmet())
app.use(
  cors({
    origin: '*', // Or specify your React app's domain, e.g., 'http://localhost:3000'
  })
)
app.use(xss())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileupload())

app.get('/', (req, res) => {
  res.send(
    '<h1>Jocetech Solution API</h1><a href="/api-docs">Documentation</a>'
  )
})

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/orders', orderRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
