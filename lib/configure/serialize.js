'use strict';

exports.__esModule = true;
exports['default'] = configureSerializing;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function configureSerializing() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var User = options.User;
  if (!User) throw new Error('[fl-auth] Missing User model from configureSerializing, got ' + options);

  // serialize users to their id
  _passport2['default'].serializeUser(options.serializing.serializeUser);
  _passport2['default'].deserializeUser(options.serializing.deserializeUser);
}

module.exports = exports['default'];