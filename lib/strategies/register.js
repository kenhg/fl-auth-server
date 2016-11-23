'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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