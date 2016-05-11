'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports.findOrCreateAccessToken = findOrCreateAccessToken;
exports.parseAuthHeader = parseAuthHeader;
exports.expireToken = expireToken;
exports.logout = logout;
exports.sendError = sendError;
exports.createToken = createToken;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _queueAsync = require('queue-async');

var _queueAsync2 = _interopRequireDefault(_queueAsync);

var _modelsAccessToken = require('../models/AccessToken');

var _modelsAccessToken2 = _interopRequireDefault(_modelsAccessToken);

var _modelsRefreshToken = require('../models/RefreshToken');

var _modelsRefreshToken2 = _interopRequireDefault(_modelsRefreshToken);

var RESOURCE_EXPIRY_MINS = 5;
var TOKEN_EXPIRY_MINS = 120;
var SESSION_EXPIRY_DAYS = 365;

function cleanUpTokens(callback) {
  _modelsAccessToken2['default'].destroy({ expiresDate: { $lte: _moment2['default'].utc().subtract(RESOURCE_EXPIRY_MINS, 'minutes').toDate() } }, function (err) {
    if (err) return callback(err);
    _modelsRefreshToken2['default'].destroy({ createdDate: { $lte: _moment2['default'].utc().subtract(SESSION_EXPIRY_DAYS, 'days').toDate() } }, callback);
  });
}

function getExpiryTime() {
  return _moment2['default'].utc().add(TOKEN_EXPIRY_MINS, 'minutes').toDate();
}

function findOrCreateAccessToken(query, options, done) {
  if (options === undefined) options = {};

  var callback = function callback(err, accessToken) {
    if (err) return done(err);
    if (!accessToken) return done(new Error('Failed to create Access Token'));
    done(null, accessToken.get('token'), accessToken.get('refreshToken_id'), { expiresDate: accessToken.get('expiresDate') });
  };

  var accessToken = null;
  var refreshToken = options.refreshToken;
  var queue = new _queueAsync2['default'](1);

  // check for existing token for non-expiring tokens
  if (!options.expires) {
    queue.defer(function (callback) {
      _modelsAccessToken2['default'].findOne(query, function (err, _accessToken) {
        if (err) return callback(err);
        if (_accessToken && !_accessToken.get('expiresDate')) return callback(); // exists but expires
        accessToken = _accessToken;
        callback();
      });
    });
  } else if (!refreshToken) {
    queue.defer(function (callback) {
      refreshToken = new _modelsRefreshToken2['default'](query);
      refreshToken.save(callback);
    });
  }

  queue.await(function (err) {
    if (err) return callback(err);
    if (accessToken) callback(null, accessToken);

    var createQuery = _lodash2['default'].clone(query);
    if (options.expires) _lodash2['default'].extend(createQuery, { expiresDate: getExpiryTime(), refreshToken: refreshToken.id });
    accessToken = new _modelsAccessToken2['default'](createQuery);

    accessToken.save(function (err) {
      if (err) return callback(err);
      cleanUpTokens(function (err) {
        return callback(err, accessToken);
      });
    });
  });
}

// Usage: parseAuthHeader(req, 'Bearer')

function parseAuthHeader(req, name) {
  if (!req.headers.authorization) return null;

  var parts = req.headers.authorization.split(' ');
  if (parts.length !== 2) return null;

  var scheme = parts[0];
  var credentials = parts[1];
  var auth = null;
  if (new RegExp('^' + name + '$', 'i').test(scheme)) auth = credentials;
  return auth;
}

function expireToken(token, callback) {
  _modelsAccessToken2['default'].destroy({ token: token }, callback);
}

function logout(req, callback) {
  req.logout();
  var accessToken = req.session.accessToken;
  req.session.destroy(function (err) {
    if (err) console.log('[fl-auth] logout: Error destroying session', err);
    if (accessToken) {
      return expireToken(accessToken.token, function (err) {
        if (err) console.log('[fl-auth] logout: Failed to expire accessToken', err);
        callback(err);
      });
    }
    callback(err);
  });
}

function sendError(res, err) {
  res.status(500).send({ error: err.message || err });
}

function createToken() {
  var length = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];

  return _crypto2['default'].randomBytes(length).toString('hex');
}