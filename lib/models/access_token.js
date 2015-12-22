'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var db_url = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
if (!db_url) console.log('Missing process.env.DATABASE_URL');

var AccessToken = (function (_Backbone$Model) {
  _inherits(AccessToken, _Backbone$Model);

  function AccessToken() {
    _classCallCheck(this, AccessToken);

    _Backbone$Model.apply(this, arguments);

    this.url = db_url + '/access_tokens';

    this.schema = function () {
      return {
        created_at: [{ indexed: true }],
        expires_at: [{ indexed: true }],
        refresh_token: function refresh_token() {
          return ['belongsTo', require('./refresh_token')];
        }
      };
    };
  }

  AccessToken.prototype.defaults = function defaults() {
    return { created_at: _moment2['default'].utc().toDate() };
  };

  return AccessToken;
})(_backbone2['default'].Model);

exports['default'] = AccessToken;

AccessToken.prototype.sync = require('backbone-mongo').sync(AccessToken);
module.exports = exports['default'];