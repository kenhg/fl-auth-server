'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lib = require('../lib');

var _Local = require('./Local');

var _Local2 = _interopRequireDefault(_Local);

var RegisterStrategy = (function (_LocalStrategy) {
  _inherits(RegisterStrategy, _LocalStrategy);

  function RegisterStrategy() {
    _classCallCheck(this, RegisterStrategy);

    _LocalStrategy.apply(this, arguments);
  }

  RegisterStrategy.prototype.verify = function verify(req, email, password, callback) {
    var _this = this;

    var User = this.User;

    User.findOne({ email: email }, function (err, existingUser) {
      if (err) return callback(err);
      if (existingUser) return callback(null, false, 'User already exists');

      var extraParams = _lodash2['default'].pick(req.body, _this.extraRegisterParams);
      var user = new User(_extends({ email: email, password: User.createHash(password), emailConfirmationToken: _lib.createToken() }, extraParams));
      user.save(function (err) {
        if (err) return callback(err);

        if (user.onCreate) {
          user.onCreate(function (err) {
            return callback(err, user);
          });
        } else {
          callback(null, user);
        }

        _this.sendConfirmationEmail(user, function (err) {
          if (err) console.log('Error sending confirmation email');
        });
      });
    });
  };

  return RegisterStrategy;
})(_Local2['default']);

exports['default'] = RegisterStrategy;
module.exports = exports['default'];