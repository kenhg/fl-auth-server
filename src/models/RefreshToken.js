import moment from 'moment'
import Backbone from 'backbone'
import {createToken} from '../lib'

const db_url = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!db_url) console.log('Missing process.env.DATABASE_URL')

export default class RefreshToken extends Backbone.Model {
  url = `${db_url}/refresh_tokens`
  schema = () => ({
    created_at: ['Date', {indexed: true}],
    expires_at: ['Date', {indexed: true}],
    token: ['String', {indexed: true}],

    user_id: ['Integer', {indexed: true}],

    access_tokens: () => ['hasMany', require('./AccessToken')],
  })

  defaults() {
    return {
      created_at: moment.utc().toDate(),
      token: createToken(),
    }
  }

}

if (db_url.split(':')[0] === 'mongodb') {
  RefreshToken.prototype.sync = require('backbone-mongo').sync(RefreshToken)
}
else {
  RefreshToken.prototype.sync = require('backbone-sql').sync(RefreshToken)
}
