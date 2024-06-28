const checkPermissions = require('./checkPermission')
const createTokenUser = require('./createTokenUser')
const { createJWT, verifyJWT, attachCookiesToResponse } = require('./jwt')

module.exports = {
  createJWT,
  verifyJWT,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
}
