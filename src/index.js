import _ from 'lodash'
import configureStrategies from './configure/strategies'
import configureRoutes from './configure/routes'
import configureMiddleware from './configure/middleware'
import configureSerializing from './configure/serialize'
import sessionOrToken from './middleware/session_or_token'
import createAuthMiddleware from './middleware/authorised'
import createInternalMiddleware from './middleware/internal'
import AccessToken from './models/AccessToken'
import RefreshToken from './models/RefreshToken'
import {createToken} from './lib'

const defaults = {
  middleware: {
    initialize: true,
    session: true,
  },
  serializing: {
  },
  paths: {
    login: '/login',
    logout: '/logout',
    register: '/register',
    resetRequest: '/reset-request',
    reset: '/reset',
    confirm: '/confirm-email',
    success: '/',
  },
  facebook: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/facebook',
      callback: '/auth/facebook/callback',
    },
    scope: ['email'],
    profileFields: ['id', 'displayName', 'email'],
  },
  linkedin: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/linkedin',
      callback: '/auth/linkedin/callback',
    },
    scope: ['r_emailaddress', 'r_basicprofile'],
    profileFields: ['first-name', 'last-name', 'email-address', 'formatted-name', 'location', 'industry', 'summary', 'specialties', 'positions', 'picture-url', 'public-profile-url'],
    onUserCreated: (user, profile, callback) => callback(),
  },
  login: {
    usernameField: 'email',
    passwordField: 'password',
    bad_request_message: 'Missing credentials',
    resetToken_expires_ms: 1000 * 60 * 60 * 24 * 7, // 7 days
    extra_register_params: [],
  },
  sendConfirmationEmail: (user, callback) => {
    console.log('[fl-auth] sendConfirmationEmail not configured. No email confirmation email will be sent. Token:', user.get('email'), user.get('emailConfirmationToken'))
    callback()
  },
  sendResetEmail: (user, callback) => {
    console.log('[fl-auth] sendResetEmail not configured. No password reset email will be sent. Reset token:', user.get('email'), user.get('resetToken'))
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

export {configure, sessionOrToken, createAuthMiddleware, createInternalMiddleware, AccessToken, RefreshToken, createToken}
