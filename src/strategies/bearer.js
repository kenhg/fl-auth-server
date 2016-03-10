import _ from 'lodash'
import moment from 'moment'
import {Strategy} from 'passport'
import {parseAuthHeader, logout} from '../lib'
import AccessToken from '../models/AccessToken'

const defaults = {
  name: 'bearer',
  check_request: true,
  check_cookies: true,
}

// bearer token that considers request and cookies
export default class BearerStrategy extends Strategy {

  constructor(options, verify) {
    super(options)
    _.defaults(options, defaults)
    _.merge(this, options)
    if (!this.User) throw new Error('[fl-auth] PasswordStrategy: Missing User from options')
    if (verify) this.verify = verify
  }

  verify(req, token, callback) {
    console.log('verifying', token)
    const User = this.User

    AccessToken.cursor({token, $one: true}).toJSON((err, access_token) => {
      if (err || !access_token) return callback(err, false)

      // todo: when to refresh tokens?
      // const expires_at = access_token.expires_at

      // if (expires_at && moment().isAfter(expires_at)) {
      //   this.refreshToken(access_token.refresh_token, (err, new_access_token) => {
      //     if (err || !new_access_token) {
      //       logout()
      //       return res.redirect(302, `/login?redirect_to=${req.url}`)
      //     }
      //     req.session.access_token = new_access_token
      //     req.session.save(err => { if (err) console.log('Failed to save access token to session during refresh') } )
      //     next()
      //   })

      // } else next()

      User.findOne(access_token.user_id, (err, user) => {
        if (err) return callback(err)
        callback(null, user)
      })
    })
  }

  refreshToken(refresh_token, callback) {
    callback()
  }

  authenticate(req) {
    let token = null

    if (req.headers && req.headers.authorization) token = parseAuthHeader(req, 'Bearer')

    if (this.check_request && !token) token = ((req.query && req.query.$access_token) || (req.body && req.body.$access_token))
    if (req.body && req.body.$access_token) delete req.body.$access_token

    if (this.check_cookies && !token && req.cookies) token = req.cookies.access_token

    if (!token) return this.fail(401)

    this.verify(req, token, (err, user, info) => {
      if (err) return this.error(err)
      if (!user) return this.fail(401)
      this.success(user, info)
    })
  }

}
