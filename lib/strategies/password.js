'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

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