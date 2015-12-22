'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = configureSerializing;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function configureSerializing() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var User = options.User;
  if (!User) throw new Error('[fl-auth] Missing User model from configureSerializing, got ' + options);

  // serialize users to their id
  _passport2['default'].serializeUser(function (user, callback) {
    if (!user) return callback(new Error('User missing'));
    callback(null, user.id);
  });

  _passport2['default'].deserializeUser(function (id, callback) {
    return User.findOne(id, callback);
  });
}

module.exports = exports['default'];