'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _passport = require('passport');

var _lib = require('../lib');

var _modelsAccess_token = require('../models/access_token');

var _modelsAccess_token2 = _interopRequireDefault(_modelsAccess_token);

var defaults = {
  name: 'bearer',
  check_request: true,
  check_cookies: true
};

// bearer token that considers request and cookies

var BearerStrategy = (function (_Strategy) {
  _inherits(BearerStrategy, _Strategy);

  function BearerStrategy(options, verify) {
    _classCallCheck(this, BearerStrategy);

    _Strategy.call(this, options);
    _lodash2['default'].defaults(options, defaults);
    _lodash2['default'].merge(this, options);
    if (!this.User) throw new Error('[fl-auth] PasswordStrategy: Missing User from options');
    if (verify) this.verify = verify;
  }

  BearerStrategy.prototype.verify = function verify(req, access_token_id, callback) {
    console.log('verifying', access_token_id);
    var User = this.User;

    _modelsAccess_token2['default'].cursor({ id: access_token_id, $one: true }).toJSON(function (err, access_token) {
      if (err || !access_token) return callback(err, false);

      // todo: when to refresh tokens?
      // const expires_at = access_token.expires_at

      // if (expires_at && moment().isAfter(expires_at)) {
      //   this.refreshToken(access_token.refresh_token, (err, new_access_token) => {
      //     if (err || !new_access_token) {
      //       logout()
      //       return res.redirect(302, `/login?redirect_to=${req.url}`)
      //     }
      //     req.session.access_token = new_access_token
      //     req.session.save(err => { if (err) console.log('Failed to save access token to session during refresh') } )
      //     next()
      //   })

      // } else next()

      User.findOne(access_token.user_id, function (err, user) {
        if (err) return callback(err);
        callback(null, user);
      });
    });
  };

  BearerStrategy.prototype.refreshToken = function refreshToken(refresh_token, callback) {
    callback();
  };

  BearerStrategy.prototype.authenticate = function authenticate(req) {
    var _this = this;

    var access_token = null;

    if (req.headers && req.headers.authorization) access_token = _lib.parseAuthHeader(req, 'Bearer');

    if (this.check_request && !access_token) access_token = req.query && req.query.$access_token || req.body && req.body.$access_token;
    if (req.body && req.body.$access_token) delete req.body.$access_token;

    if (this.check_cookies && !access_token && req.cookies) access_token = req.cookies.access_token;

    if (!access_token) return this.fail(401);

    this.verify(req, access_token, function (err, user, info) {
      if (err) return _this.error(err);
      if (!user) return _this.fail(401);
      _this.success(user, info);
    });
  };

  return BearerStrategy;
})(_passport.Strategy);

exports['default'] = BearerStrategy;
module.exports = exports['default'];