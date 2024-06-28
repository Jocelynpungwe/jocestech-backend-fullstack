const { UnauthenticatedError, UnauthorizedError } = require('../errors')
const { verifyJWT } = require('../utils/jwt')
const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies
  if (!token) {
    throw new UnauthenticatedError('Authentication Invalid')
  }

  try {
    const { name, userId, role } = verifyJWT(token)
    req.user = { name, userId, role }
    next()
  } catch (error) {
    throw new UnauthorizedError('Authentication Invalid')
  }
}

module.exports = authenticateUser
