'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Local = require('./Local');

var _Local2 = _interopRequireDefault(_Local);

// Strategy to log a user in using their username/password

var PasswordStrategy = (function (_LocalStrategy) {
  _inherits(PasswordStrategy, _LocalStrategy);

  function PasswordStrategy() {
    _classCallCheck(this, PasswordStrategy);

    _LocalStrategy.apply(this, arguments);
  }

  PasswordStrategy.prototype.verify = function verify(req, email, password, callback) {
    var User = this.User;

    User.findOne({ email: email }, function (err, user) {
      if (err) return callback(err);
      if (!user) {
        console.log('[fl-auth] email error: user not found', email);
        return callback(null, false, 'User not found');
      }
      if (!user.passwordIsValid(password)) {
        return callback(null, false, 'Incorrect password');
      }
      callback(null, user);
    });
  };

  return PasswordStrategy;
})(_Local2['default']);

exports['default'] = PasswordStrategy;
module.exports = exports['default'];