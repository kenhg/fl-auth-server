import LocalStrategy from './local'
import moment from 'moment'

export default class ResetStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User

    const {reset_token} = req.body
    if (!reset_token) return callback(null, null, 'No token provided')

    User.findOne({reset_token}, (err, user) => {
      if (err) return callback(err)
      if (!user) return callback(null, null, 'No user found with this token')

      if (moment.utc().diff(moment(user.get('reset_token_created_at'))) > this.reset_token_expires_ms) callback(null, null, 'This token has expired')

      user.save({
        password: User.createHash(password),
        reset_token: null,
        reset_token_created_at: null,
      }, callback)

    })
  }

}
