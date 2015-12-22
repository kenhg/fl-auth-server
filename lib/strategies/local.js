'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _passport = require('passport');

var _lib = require('../lib');

var RegisterStrategy = (function (_Strategy) {
  _inherits(RegisterStrategy, _Strategy);

  function RegisterStrategy(options, verify) {
    if (options === undefined) options = {};

    _classCallCheck(this, RegisterStrategy);

    _Strategy.call(this);
    _lodash2['default'].merge(this, options);
    if (!this.User) throw new Error('[fl-auth] LocalStrategy: Missing User from options');
    if (verify) this.verify = verify.bind(this);
  }

  RegisterStrategy.prototype.isValidEmail = function isValidEmail(email) {
    return email && email.match(/.+@.+/);
  };

  RegisterStrategy.prototype.authenticate = function authenticate(req) {
    var _this = this;

    var email = req.body && req.body[this.username_field] || req.query && req.query[this.username_field];
    var password = req.body && req.body[this.password_field] || req.query && req.query[this.password_field];

    if (!this.isValidEmail(email) || !password) return this.fail(this.bad_request_message);

    this.verify(req, email, password, function (err, user, info) {
      if (err) return _this.error(err);
      if (!user) return _this.fail(info);

      _lib.findOrCreateAccessToken({ user_id: user.id }, { expires: true }, function (err, access_token, refresh_token, info) {
        if (err) return _this.error(err);

        req.session.access_token = { id: access_token, expires_at: info.expires_at };
        req.session.save(function (err) {
          if (err) console.log('Error saving session', err);
        });
        _this.success(_lodash2['default'].pick.apply(_lodash2['default'], [user.toJSON(), 'id', 'email'].concat(_this.extra_register_params)), { access_token: access_token });
      });
    });
  };

  return RegisterStrategy;
})(_passport.Strategy);

exports['default'] = RegisterStrategy;
module.exports = exports['default'];