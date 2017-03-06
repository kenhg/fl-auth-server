'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.configureFacebook = configureFacebook;
exports.configureLinkedIn = configureLinkedIn;
exports['default'] = configureStrategies;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportFacebook = require('passport-facebook');

var _passportLinkedinOauth2 = require('passport-linkedin-oauth2');

var _strategies = require('../strategies');

function configureFacebook(options, strategyOptions) {
  if (!options.facebook.clientId) return console.log('[fl-auth-server] Missing facebook option clientId, got', options.facebook);
  if (!options.facebook.clientSecret) return console.log('[fl-auth-server] Missing facebook option clientSecret, got', options.facebook);

  var User = options.User;
  _passport2['default'].use(new _passportFacebook.Strategy({
    clientID: options.facebook.clientId,
    clientSecret: options.facebook.clientSecret,
    callbackURL: options.facebook.url + options.facebook.paths.callback,
    profileFields: options.facebook.profileFields
  }, function (token, refreshToken, profile, callback) {
    var email = _lodash2['default'].get(profile, 'emails[0].value', '');
    if (!email) return callback(new Error('[fl-auth] FacebookStrategy: No email from Facebook, got profile: ' + JSON.stringify(profile)));

    User.findOrCreate({ email: email }, function (err, user) {
      if (err) return callback(err);
      user.save({ facebookId: profile.id, name: profile.displayName, facebookAccessToken: token }, callback);
    });
  }));

  _passport2['default'].use('facebookMobile', new _strategies.FacebookMobileStrategy(_lodash2['default'].extend({}, strategyOptions, { facebook: options.facebook })));
}

function configureLinkedIn(options) {
  if (!options.linkedin.clientId) console.log('[fl-auth-server] Missing linkedin option clientId, got', options.linkedin);
  if (!options.linkedin.clientSecret) console.log('[fl-auth-server] Missing facebook option clientSecret, got', options.linkedin);

  var User = options.User;
  _passport2['default'].use(new _passportLinkedinOauth2.Strategy({
    clientID: options.linkedin.clientId,
    clientSecret: options.linkedin.clientSecret,
    callbackURL: options.linkedin.url + options.linkedin.paths.callback,
    profileFields: options.linkedin.profileFields,
    scope: options.linkedin.scope,
    state: true
  }, function (token, refreshToken, profile, callback) {
    var email = _lodash2['default'].get(profile, 'emails[0].value', '');
    if (!email) return callback(new Error('[fl-auth] LinkedInStrategy: No email from LinkedIn, got profile: ' + JSON.stringify(profile)));

    User.findOne({ email: email }, function (err, existingUser) {
      if (err) return callback(err);

      var user = existingUser || new User({ email: email });
      var isNew = !existingUser;

      user.save({ linkedinId: profile.id, linkedinAccessToken: token }, function (err) {
        if (err) return callback(err);

        options.linkedin.onLogin(user, profile, isNew, function (err) {
          if (err) return callback(err);
          callback(null, user);
        });
      });
    });
  }));
}

function configureStrategies() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var User = options.User;
  if (!User) throw new Error('[fl-auth] Missing User model from configureStrategies, got ' + options);

  // passport functions
  var strategyOptions = _extends({ User: User, sendConfirmationEmail: options.sendConfirmationEmail }, options.login);
  _passport2['default'].use('password', new _strategies.PasswordStrategy(strategyOptions));
  _passport2['default'].use('register', new _strategies.RegisterStrategy(strategyOptions));
  _passport2['default'].use('bearer', new _strategies.BearerStrategy(strategyOptions));
  _passport2['default'].use('reset', new _strategies.ResetStrategy(strategyOptions));

  if (options.facebook) configureFacebook(options, strategyOptions);
  if (options.linkedin) configureLinkedIn(options);
}