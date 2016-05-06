import moment from 'moment'
import Backbone from 'backbone'
import bcrypt from 'bcrypt-nodejs'

const db_url = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!db_url) console.log('Missing process.env.DATABASE_URL')

export default class User extends Backbone.Model {
  url = `${db_url}/users`
  schema = () => ({
    // access_tokens: () => ['hasMany', require('./AccessToken')],
  })

  static createHash(password) { return bcrypt.hashSync(password) }

  defaults() { return {created_at: moment.utc().toDate()} }

  passwordIsValid(password) { return bcrypt.compareSync(password, this.get('password')) }

}

if (db_url.split(':')[0] === 'mongodb') {
  User.prototype.sync = require('backbone-mongo').sync(User)
}
else {
  User.prototype.sync = require('fl-backbone-sql').sync(User)
}
