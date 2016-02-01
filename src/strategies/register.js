import _ from 'lodash'
import {createToken} from '../lib'
import LocalStrategy from './local'

export default class RegisterStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User

    User.findOne({email}, (err, existing_user) => {
      if (err) return callback(err)
      if (existing_user) return callback(null, false, 'User already exists')

      const extra_params = _.pick(req.body, this.extra_register_params)
      const user = new User({email, password: User.createHash(password), email_confirmation_token: createToken(), ...extra_params})
      user.save(err => {
        if (err) return callback(err)
        if (user.onCreate) {
          console.log('create')
          user.onCreate(err => callback(err, user))
        }
        else callback(null, user)
        this.sendConfirmationEmail(user, err => {
          if (err) console.log('Error sending confirmation email')
        })
      })
    })
  }

}
