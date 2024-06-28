const { UnauthorizedError } = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return
  if (requestUser.userId === resourceUserId.toString()) return
  throw new UnauthorizedError('Not authorixed to access this routes')
}

module.exports = checkPermissions
