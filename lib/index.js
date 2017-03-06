'use strict';

exports.__esModule = true;
exports['default'] = configure;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _configureStrategies = require('./configure/strategies');

var _configureStrategies2 = _interopRequireDefault(_configureStrategies);

var _configureRoutes = require('./configure/routes');

var _configureRoutes2 = _interopRequireDefault(_configureRoutes);

var _configureMiddleware = require('./configure/middleware');

var _configureMiddleware2 = _interopRequireDefault(_configureMiddleware);

var _configureSerialize = require('./configure/serialize');

var _configureSerialize2 = _interopRequireDefault(_configureSerialize);

var _middlewareSessionOrToken = require('./middleware/sessionOrToken');

var _middlewareSessionOrToken2 = _interopRequireDefault(_middlewareSessionOrToken);

var _middlewareAuthorised = require('./middleware/authorised');

var _middlewareAuthorised2 = _interopRequireDefault(_middlewareAuthorised);

var _middlewareInternal = require('./middleware/internal');

var _middlewareInternal2 = _interopRequireDefault(_middlewareInternal);

var _modelsAccessToken = require('./models/AccessToken');

var _modelsAccessToken2 = _interopRequireDefault(_modelsAccessToken);

var _modelsRefreshToken = require('./models/RefreshToken');

var _modelsRefreshToken2 = _interopRequireDefault(_modelsRefreshToken);

var _lib = require('./lib');

var defaults = {
  middleware: {
    initialize: true,
    session: true
  },
  paths: {
    login: '/login',
    logout: '/logout',
    loginStatus: '/login-status',
    register: '/register',
    resetRequest: '/reset-request',
    reset: '/reset',
    confirm: '/confirm-email',
    success: '/'
  },
  serializing: {},
  facebook: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/facebook',
      callback: '/auth/facebook/callback',
      mobile: '/auth/facebook/mobile'
    },
    scope: ['email'],
    profileFields: ['id', 'displayName', 'email'],
    onLogin: function onLogin(user, profile, isNew, callback) {
      return callback();
    }
  },
  linkedin: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/linkedin',
      callback: '/auth/linkedin/callback'
    },
    scope: ['r_emailaddress', 'r_basicprofile'],
    profileFields: ['first-name', 'last-name', 'email-address', 'formatted-name', 'location', 'industry', 'summary', 'specialties', 'positions', 'picture-url', 'public-profile-url'],
    onLogin: function onLogin(user, profile, isNew, callback) {
      return callback();
    }
  },
  login: {
    usernameField: 'email',
    passwordField: 'password',
    badRequestMessage: 'Missing credentials',
    resetTokenExpiresMs: 1000 * 60 * 60 * 24 * 7, // 7 days
    extraRegisterParams: []
  },
  sendConfirmationEmail: function sendConfirmationEmail(user, callback) {
    console.log('[fl-auth] sendConfirmationEmail not configured. No email confirmation email will be sent. Token:', user.get('email'), user.get('emailConfirmationToken'));
    callback();
  },
  sendResetEmail: function sendResetEmail(user, callback) {
    console.log('[fl-auth] sendResetEmail not configured. No password reset email will be sent. Reset token:', user.get('email'), user.get('resetToken'));
    callback();
  },

  setReturnTo: function setReturnTo(req, res, next) {
    req.session.returnTo = req.query.returnTo || req.headers.referer;
    req.session.save(function (err) {
      if (err) console.log('[fl-auth] Error saving session', err);
      next();
    });
  }
};

function configure() {
  var _options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var options = _lodash2['default'].merge(defaults, _options);
  if (!options.app) throw new Error('[fl-auth] init: Missing app from options');
  if (!options.User) options.User = require('./models/user');

  if (!options.serializing.serializeUser) {
    options.serializing.serializeUser = function (user, callback) {
      if (!user) return callback(new Error('[fl-auth] User missing'));
      callback(null, user.id);
    };
  }
  if (!options.serializing.deserializeUser) {
    options.serializing.deserializeUser = function (id, callback) {
      return options.User.cursor({ id: id, $one: true }).toJSON(callback);
    };
  }

  _configureMiddleware2['default'](options);
  _configureSerialize2['default'](options);
  _configureStrategies2['default'](options);
  _configureRoutes2['default'](options);
}

exports.configure = configure;
exports.sessionOrToken = _middlewareSessionOrToken2['default'];
exports.createAuthMiddleware = _middlewareAuthorised2['default'];
exports.createInternalMiddleware = _middlewareInternal2['default'];
exports.AccessToken = _modelsAccessToken2['default'];
exports.RefreshToken = _modelsRefreshToken2['default'];
exports.createToken = _lib.createToken;