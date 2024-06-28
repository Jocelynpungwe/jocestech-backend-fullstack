const { UnauthorizedError } = require('../errors')

const authorizePermition = (...roles) => {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Unauthorized to access this route')
    }
    next()
  }
}

module.exports = authorizePermition
