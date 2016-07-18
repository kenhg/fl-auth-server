'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _passport = require('passport');

var _lib = require('../lib');

var LocalStrategy = (function (_Strategy) {
  _inherits(LocalStrategy, _Strategy);

  function LocalStrategy(options, verify) {
    if (options === undefined) options = {};

    _classCallCheck(this, LocalStrategy);

    _Strategy.call(this);
    _lodash2['default'].merge(this, options);
    if (!this.User) throw new Error('[fl-auth] LocalStrategy: Missing User from options');
    if (verify) this.verify = verify.bind(this);
  }

  LocalStrategy.prototype.isValidEmail = function isValidEmail(email) {
    return email && _lodash2['default'].isString(email) && email.match(/.+@.+/);
  };

  LocalStrategy.prototype.authenticate = function authenticate(req) {
    var _this = this;

    var email = req.body && req.body[this.usernameField] || req.query && req.query[this.usernameField];
    var password = req.body && req.body[this.passwordField] || req.query && req.query[this.passwordField];

    if (!this.isValidEmail(email) || !password) return this.fail(this.badRequestMessage);

    this.verify(req, email.trim(), password, function (err, user, info) {
      if (err) return _this.error(err);
      if (!user) return _this.fail(info);

      _lib.findOrCreateAccessToken({ user_id: user.id }, { expires: true }, function (err, token, refreshToken, info) {
        if (err) return _this.error(err);

        req.session.accessToken = { token: token, expiresDate: info.expiresDate };
        req.session.save(function (err) {
          if (err) console.log('Error saving session', err);
        });
        _this.success(_lodash2['default'].omit(user.toJSON(), 'password'), { accessToken: token });
      });
    });
  };

  return LocalStrategy;
})(_passport.Strategy);

exports['default'] = LocalStrategy;
module.exports = exports['default'];