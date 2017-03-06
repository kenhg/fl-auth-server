'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _lib = require('../lib');

var dbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) console.log('Missing process.env.DATABASE_URL');

var AccessToken = (function (_Backbone$Model) {
  _inherits(AccessToken, _Backbone$Model);

  function AccessToken() {
    _classCallCheck(this, AccessToken);

    _Backbone$Model.apply(this, arguments);

    this.url = dbUrl + '/accessTokens';

    this.schema = function () {
      return {
        createdDate: ['DateTime', { indexed: true }],
        expiresDate: ['DateTime', { indexed: true }],
        token: ['String', { indexed: true }],

        // Leave the user relation out to allow for drop in replacement of user models,
        // then add this field to the schema to ensure column creation in sql.
        user_id: ['Integer', { indexed: true }],

        refreshToken: function refreshToken() {
          return ['belongsTo', require('./RefreshToken')];
        }
      };
    };
  }

  AccessToken.prototype.defaults = function defaults() {
    return {
      createdDate: _moment2['default'].utc().toDate(),
      token: _lib.createToken()
    };
  };

  return AccessToken;
})(_backbone2['default'].Model);

exports['default'] = AccessToken;

if (dbUrl.split(':')[0] === 'mongodb') {
  AccessToken.prototype.sync = require('backbone-mongo').sync(AccessToken);
} else {
  AccessToken.prototype.sync = require('fl-backbone-sql').sync(AccessToken);
}
module.exports = exports['default'];