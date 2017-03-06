'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var dbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) console.log('Missing process.env.DATABASE_URL');

var User = (function (_Backbone$Model) {
  _inherits(User, _Backbone$Model);

  function User() {
    _classCallCheck(this, User);

    _Backbone$Model.apply(this, arguments);

    this.url = dbUrl + '/users';

    this.schema = function () {
      return {
        // accessTokens: () => ['hasMany', require('./AccessToken')],
      };
    };
  }

  User.createHash = function createHash(password) {
    return _bcryptNodejs2['default'].hashSync(password);
  };

  User.prototype.defaults = function defaults() {
    return { createdDate: _moment2['default'].utc().toDate() };
  };

  User.prototype.passwordIsValid = function passwordIsValid(password) {
    return _bcryptNodejs2['default'].compareSync(password, this.get('password'));
  };

  return User;
})(_backbone2['default'].Model);

exports['default'] = User;

if (dbUrl.split(':')[0] === 'mongodb') {
  User.prototype.sync = require('backbone-mongo').sync(User);
} else {
  User.prototype.sync = require('fl-backbone-sql').sync(User);
}
module.exports = exports['default'];