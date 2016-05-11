import _ from 'lodash'
import crypto from 'crypto'
import moment from 'moment'
import Queue from 'queue-async'
import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'

const RESOURCE_EXPIRY_MINS = 5
const TOKEN_EXPIRY_MINS = 120
const SESSION_EXPIRY_DAYS = 365


function cleanUpTokens(callback) {
  AccessToken.destroy({expiresDate: {$lte: moment.utc().subtract(RESOURCE_EXPIRY_MINS, 'minutes').toDate()}}, err => {
    if (err) return callback(err)
    RefreshToken.destroy({createdDate: {$lte: moment.utc().subtract(SESSION_EXPIRY_DAYS, 'days').toDate()}}, callback)
  })
}

function getExpiryTime() { return moment.utc().add(TOKEN_EXPIRY_MINS, 'minutes').toDate() }


export function findOrCreateAccessToken(query, options={}, done) {

  const callback = (err, accessToken) => {
    if (err) return done(err)
    if (!accessToken) return done(new Error('Failed to create Access Token'))
    done(null, accessToken.get('token'), accessToken.get('refreshToken_id'), {expiresDate: accessToken.get('expiresDate')})
  }

  let accessToken = null
  let refreshToken = options.refreshToken
  const queue = new Queue(1)

  // check for existing token for non-expiring tokens
  if (!options.expires) {
    queue.defer((callback) => {
      AccessToken.findOne(query, (err, _accessToken) => {
        if (err) return callback(err)
        if (_accessToken && !_accessToken.get('expiresDate')) return callback() // exists but expires
        accessToken = _accessToken
        callback()
      })
    })
  }
  else if (!refreshToken) {
    queue.defer((callback) => {
      refreshToken = new RefreshToken(query)
      refreshToken.save(callback)
    })
  }

  queue.await(err => {
    if (err) return callback(err)
    if (accessToken) callback(null, accessToken)

    const createQuery = _.clone(query)
    if (options.expires) _.extend(createQuery, {expiresDate: getExpiryTime(), refreshToken: refreshToken.id})
    accessToken = new AccessToken(createQuery)

    accessToken.save(err => {
      if (err) return callback(err)
      cleanUpTokens(err => callback(err, accessToken))
    })
  })
}

// Usage: parseAuthHeader(req, 'Bearer')
export function parseAuthHeader(req, name) {
  if (!req.headers.authorization) return null

  const parts = req.headers.authorization.split(' ')
  if (parts.length !== 2) return null

  const scheme = parts[0]
  const credentials = parts[1]
  let auth = null
  if (new RegExp(`^${name}$`, 'i').test(scheme)) auth = credentials
  return auth
}

export function expireToken(token, callback) {
  AccessToken.destroy({token}, callback)
}

export function logout(req, callback) {
  req.logout()
  const accessToken = req.session.accessToken
  req.session.destroy(err => {
    if (err) console.log('[fl-auth] logout: Error destroying session', err)
    if (accessToken) {
      return expireToken(accessToken.token, err => {
        if (err) console.log('[fl-auth] logout: Failed to expire accessToken', err)
        callback(err)
      })
    }
    callback(err)
  })
}

export function sendError(res, err) {
  res.status(500).send({error: err.message || err})
}

export function createToken(length=20) {
  return crypto.randomBytes(length).toString('hex')
}
