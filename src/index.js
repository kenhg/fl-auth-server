import _ from 'lodash'
import configureStrategies from './configure/strategies'
import configureRoutes from './configure/routes'
import configureMiddleware from './configure/middleware'
import configureSerializing from './configure/serialize'
import sessionOrToken from './middleware/session_or_token'
import createAuthMiddleware from './middleware/authorised'
import createInternalMiddleware from './middleware/internal'
import AccessToken from './models/access_token'
import RefreshToken from './models/refresh_token'

const defaults = {
  middleware: {
    initialize: true,
    session: true,
  },
  paths: {
    login: '/login',
    logout: '/logout',
    register: '/register',
    reset_request: '/reset_request',
    reset: '/reset',
    success: '/',
  },
  facebook: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/facebook',
      callback: '/auth/facebook/callback',
    },
    scope: ['email'],
    profile_fields: ['id', 'displayName', 'email'],
  },
  login: {
    username_field: 'email',
    password_field: 'password',
    bad_request_message: 'Missing credentials',
    reset_token_expires_ms: 1000 * 60 * 60 * 24 * 7, // 7 days
    extra_register_params: [],
  },
  sendResetEmail: (user, callback) => {
    console.log('[fl-auth] sendResetEmail not configured. No password reset email will be sent. Reset token:', user.get('email'), user.get('reset_token'))
    callback()
  },
}

export default function configure(options_={}) {
  const options = _.merge(defaults, options_)
  if (!options.app) throw new Error('[fl-auth] init: Missing app from options')

  if (!options.User) options.User = require('./models/user')

  configureMiddleware(options)
  configureSerializing(options)
  configureStrategies(options)
  configureRoutes(options)
}

export {configure, sessionOrToken, createAuthMiddleware, createInternalMiddleware, AccessToken, RefreshToken}
