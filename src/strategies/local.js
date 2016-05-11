import _ from 'lodash'
import {Strategy} from 'passport'
import {findOrCreateAccessToken} from '../lib'

export default class RegisterStrategy extends Strategy {
  constructor(options={}, verify) {
    super()
    _.merge(this, options)
    if (!this.User) throw new Error('[fl-auth] LocalStrategy: Missing User from options')
    if (verify) this.verify = verify.bind(this)
  }

  isValidEmail(email) {
    return email && _.isString(email) && email.match(/.+@.+/)
  }

  authenticate(req) {
    const email = (req.body && req.body[this.usernameField]) || (req.query && req.query[this.usernameField])
    const password = (req.body && req.body[this.passwordField]) || (req.query && req.query[this.passwordField])

    if (!this.isValidEmail(email) || !password) return this.fail(this.bad_request_message)

    this.verify(req, email, password, (err, user, info) => {
      if (err) return this.error(err)
      if (!user) return this.fail(info)

      findOrCreateAccessToken({user_id: user.id}, {expires: true}, (err, token, refreshToken, info) => {
        if (err) return this.error(err)

        req.session.accessToken = {token, expiresDate: info.expiresDate}
        req.session.save(err => {if (err) console.log('Error saving session', err)})
        this.success(_.omit(user.toJSON(), 'password'), {accessToken: token})
      })
    })
  }
}
