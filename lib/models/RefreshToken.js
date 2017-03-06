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