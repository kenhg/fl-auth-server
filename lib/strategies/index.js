'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _register = require('./register');

var _register2 = _interopRequireDefault(_register);

var _bearer = require('./bearer');

var _bearer2 = _interopRequireDefault(_bearer);

var _password = require('./password');

var _password2 = _interopRequireDefault(_password);

var _reset = require('./reset');

var _reset2 = _interopRequireDefault(_reset);

exports['default'] = { BearerStrategy: _bearer2['default'], PasswordStrategy: _password2['default'], RegisterStrategy: _register2['default'], ResetStrategy: _reset2['default'] };
module.exports = exports['default'];