import _ from 'lodash'
import {createToken} from '../lib'
import LocalStrategy from './local'

export default class RegisterStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User

    User.findOne({email}, (err, existingUser) => {
      if (err) return callback(err)
      if (existingUser) return callback(null, false, 'User already exists')

      const extra_params = _.pick(req.body, this.extraRegisterParams)
      const user = new User({email, password: User.createHash(password), emailConfirmationToken: createToken(), ...extra_params})
      user.save(err => {
        if (err) return callback(err)

        if (user.onCreate) {
          user.onCreate(err => callback(err, user))
        }
        else {
          callback(null, user)
        }

        this.sendConfirmationEmail(user, err => {
          if (err) console.log('Error sending confirmation email')
        })
      })
    })
  }

}
