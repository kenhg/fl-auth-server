'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _queueAsync = require('queue-async');

var _queueAsync2 = _interopRequireDefault(_queueAsync);

var _passport = require('passport');

var _lib = require('../lib');

// Strategy to find or create a user based on a facebookId and token obtained from the facebook mobile sdk
// Data will look like this:
/*
  accessToken: "EAADZBCoZAENeYBAKWleEKhsOR4ij5eddFRRteZC3XryC9b2aQHwOpUT9FHZB63QNjJmyjGKSNnUINueCsdleDZBDqc9FIhdeeNmIN1mp9Ayd24RSPVYkQk15ewxQS3PlIkGImE0SxzlJ0QkS4DHhkmBYnewZByDtxhhdcSJdBRRpDVZBD2h9jqvJOeJ5Ff0WnEFXGlXmjkDS3nTfa2R193rjzPDbI3efZBwZD",
  accessTokenSource: undefined,
  applicationID: "279321155745254",
  declinedPermissions: [],
  expirationTime: 1469858056033.796,
  lastRefreshTime: 1464745008038.082,
  permissions: ["public_profile", "publish_actions"],
  userID: "10153502264266581",
*/

var FacebookMobileStrategy = (function (_Strategy) {
  _inherits(FacebookMobileStrategy, _Strategy);

  function FacebookMobileStrategy() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, FacebookMobileStrategy);

    _Strategy.call(this);
    _lodash2['default'].merge(this, options);
    if (!this.User) throw new Error('[fl-auth] FacebookMobileStrategy: Missing User from options');
  }

  FacebookMobileStrategy.prototype.authenticate = function authenticate(req) {
    var _this = this;

    var User = this.User;

    console.log("authing'!");

    User.findOne({ facebookId: req.body.userID }, function (err, existingUser) {
      if (err) return _this.error(err);
      var user = existingUser;

      var queue = new _queueAsync2['default'](1);

      // Found an existing user for this facebook id. Just update their access token
      if (user) {
        queue.defer(function (callback) {
          return user.save({ facebookAccessToken: req.body }, callback);
        });
      }
      // no existing user - create a new one
      else {
          queue.defer(function (callback) {
            user = new User({ facebookId: req.body.userID, facebookAccessToken: req.body });
            user.save(callback);
          });
        }

      queue.await(function (err) {
        console.log('ok!', err, user);
        if (err) return _this.error(err);

        _lib.findOrCreateAccessToken({ user_id: user.id }, { expires: true }, function (err, token, refreshToken, info) {
          if (err) return _this.error(err);

          req.session.accessToken = { token: token, expiresDate: info.expiresDate };
          req.session.save(function (err) {
            if (err) console.log('Error saving session', err);
          });
          _this.success(_lodash2['default'].omit(user.toJSON(), 'password'), { accessToken: token });
        });
      });
    });
  };

  return FacebookMobileStrategy;
})(_passport.Strategy);

exports['default'] = FacebookMobileStrategy;
module.exports = exports['default'];