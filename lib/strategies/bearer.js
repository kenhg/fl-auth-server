'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _passport = require('passport');

var _lib = require('../lib');

var _modelsAccessToken = require('../models/AccessToken');

var _modelsAccessToken2 = _interopRequireDefault(_modelsAccessToken);

var defaults = {
  name: 'bearer',
  checkRequest: true,
  checkCookies: true
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

  BearerStrategy.prototype.verify = function verify(req, token, callback) {
    console.log('verifying', token);
    var User = this.User;

    _modelsAccessToken2['default'].cursor({ token: token, $one: true }).toJSON(function (err, accessToken) {
      if (err || !accessToken) return callback(err, false);

      // todo: when to refresh tokens?
      // const expiresDate = accessToken.expiresDate

      // if (expiresDate && moment().isAfter(expiresDate)) {
      //   this.refreshToken(accessToken.refreshToken, (err, newAccessToken) => {
      //     if (err || !newAccessToken) {
      //       logout()
      //       return res.redirect(302, `/login?redirectTo=${req.url}`)
      //     }
      //     req.session.accessToken = newAccessToken
      //     req.session.save(err => { if (err) console.log('Failed to save access token to session during refresh') } )
      //     next()
      //   })

      // } else next()

      User.findOne(accessToken.user_id, function (err, user) {
        if (err) return callback(err);
        callback(null, user);
      });
    });
  };

  BearerStrategy.prototype.refreshToken = function refreshToken(_refreshToken, callback) {
    callback();
  };

  BearerStrategy.prototype.authenticate = function authenticate(req) {
    var _this = this;

    var token = null;

    if (req.headers && req.headers.authorization) token = _lib.parseAuthHeader(req, 'Bearer');

    if (this.checkRequest && !token) token = req.query && req.query.$accessToken || req.body && req.body.$accessToken;
    if (req.body && req.body.$accessToken) delete req.body.$accessToken;

    if (this.checkCookies && !token && req.cookies) token = req.cookies.accessToken;

    if (!token) return this.fail(401);

    this.verify(req, token, function (err, user, info) {
      if (err) return _this.error(err);
      if (!user) return _this.fail(401);
      _this.success(user, info);
    });
  };

  return BearerStrategy;
})(_passport.Strategy);

exports['default'] = BearerStrategy;
module.exports = exports['default'];