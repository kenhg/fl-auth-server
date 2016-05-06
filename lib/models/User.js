'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var db_url = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
if (!db_url) console.log('Missing process.env.DATABASE_URL');

var User = (function (_Backbone$Model) {
  _inherits(User, _Backbone$Model);

  function User() {
    _classCallCheck(this, User);

    _Backbone$Model.apply(this, arguments);

    this.url = db_url + '/users';

    this.schema = function () {
      return {
        // access_tokens: () => ['hasMany', require('./AccessToken')],
      };
    };
  }

  User.createHash = function createHash(password) {
    return _bcryptNodejs2['default'].hashSync(password);
  };

  User.prototype.defaults = function defaults() {
    return { created_at: _moment2['default'].utc().toDate() };
  };

  User.prototype.passwordIsValid = function passwordIsValid(password) {
    return _bcryptNodejs2['default'].compareSync(password, this.get('password'));
  };

  return User;
})(_backbone2['default'].Model);

exports['default'] = User;

if (db_url.split(':')[0] === 'mongodb') {
  User.prototype.sync = require('backbone-mongo').sync(User);
} else {
  User.prototype.sync = require('fl-backbone-sql').sync(User);
}
module.exports = exports['default'];