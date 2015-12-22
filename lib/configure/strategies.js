'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = configureStrategies;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportFacebook = require('passport-facebook');

var _strategies = require('../strategies');

function configureStrategies() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var User = options.User;
  if (!User) throw new Error('[fl-auth] Missing User model from configureStrategies, got ' + options);

  // passport functions
  var strategy_options = _extends({ User: User, sendConfirmationEmail: options.sendConfirmationEmail }, options.login);
  _passport2['default'].use('password', new _strategies.PasswordStrategy(strategy_options));
  _passport2['default'].use('register', new _strategies.RegisterStrategy(strategy_options));
  _passport2['default'].use('bearer', new _strategies.BearerStrategy(strategy_options));
  _passport2['default'].use('reset', new _strategies.ResetStrategy(strategy_options));

  if (options.facebook && options.facebook.app_id && options.facebook.app_secret) {
    _passport2['default'].use(new _passportFacebook.Strategy({
      clientID: options.facebook.app_id,
      clientSecret: options.facebook.app_secret,
      callbackURL: options.facebook.url + options.facebook.paths.callback,
      profileFields: options.facebook.profile_fields
    }, function (access_token, refresh_token, profile, callback) {
      var email = _lodash2['default'].get(profile, 'emails[0].value', '');
      if (!email) return callback(new Error('[fl-auth] FacebookStrategy: No email from Facebook, got profile: ' + JSON.stringify(profile)));

      User.findOrCreate({ email: email }, function (err, user) {
        if (err) return callback(err);
        user.save({ facebook_id: profile.id, name: profile.displayName, facebook_access_token: access_token }, callback);
      });
    }));
  }
}

module.exports = exports['default'];