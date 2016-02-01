import moment from 'moment'
import Backbone from 'backbone'
import {createToken} from '../lib'

const db_url = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!db_url) console.log('Missing process.env.DATABASE_URL')

export default class AccessToken extends Backbone.Model {
  url = `${db_url}/access_tokens`
  schema = () => ({
    created_at: ['Date', {indexed: true}],
    expires_at: ['Date', {indexed: true}],
    refresh_token: () => ['belongsTo', require('./refresh_token')],
  })

  defaults() {
    return {
      created_at: moment.utc().toDate(),
      token: createToken(),
    }
  }

}

if (db_url.split(':')[0] === 'mongodb') {
  AccessToken.prototype.sync = require('backbone-mongo').sync(AccessToken)
}
else {
  AccessToken.prototype.sync = require('backbone-sql').sync(AccessToken)
}
