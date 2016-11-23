'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _lib = require('../lib');

var dbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) console.log('Missing process.env.DATABASE_URL');

var RefreshToken = (function (_Backbone$Model) {
  _inherits(RefreshToken, _Backbone$Model);

  function RefreshToken() {
    _classCallCheck(this, RefreshToken);

    _Backbone$Model.apply(this, arguments);

    this.url = dbUrl + '/refreshTokens';

    this.schema = function () {
      return {
        createdDate: ['DateTime', { indexed: true }],
        expiresDate: ['DateTime', { indexed: true }],
        token: ['String', { indexed: true }],

        user_id: ['Integer', { indexed: true }]

      };
    };
  }

  // accessTokens: () => ['hasMany', require('./AccessToken')],

  RefreshToken.prototype.defaults = function defaults() {
    return {
      createdDate: _moment2['default'].utc().toDate(),
      token: _lib.createToken()
    };
  };

  return RefreshToken;
})(_backbone2['default'].Model);

exports['default'] = RefreshToken;

if (dbUrl.split(':')[0] === 'mongodb') {
  RefreshToken.prototype.sync = require('backbone-mongo').sync(RefreshToken);
} else {
  RefreshToken.prototype.sync = require('fl-backbone-sql').sync(RefreshToken);
}
module.exports = exports['default'];