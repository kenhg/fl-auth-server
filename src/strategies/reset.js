import LocalStrategy from './local'
import moment from 'moment'

export default class ResetStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User

    const {resetToken} = req.body
    if (!resetToken) return callback(null, null, 'No token provided')

    User.findOne({email, resetToken}, (err, user) => {
      if (err) return callback(err)
      if (!user) return callback(null, null, 'No user found with this token')

      if (moment.utc().diff(moment(user.get('resetToken_createdDate'))) > this.resetToken_expires_ms) callback(null, null, 'This token has expired')

      user.save({
        password: User.createHash(password),
        resetToken: null,
        resetToken_createdDate: null,
      }, callback)

    })
  }

}
