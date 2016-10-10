'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _Register = require('./Register');

var _Register2 = _interopRequireDefault(_Register);

var _Bearer = require('./Bearer');

var _Bearer2 = _interopRequireDefault(_Bearer);

var _Password = require('./Password');

var _Password2 = _interopRequireDefault(_Password);

var _Reset = require('./Reset');

var _Reset2 = _interopRequireDefault(_Reset);

var _FacebookMobile = require('./FacebookMobile');

var _FacebookMobile2 = _interopRequireDefault(_FacebookMobile);

exports['default'] = { BearerStrategy: _Bearer2['default'], PasswordStrategy: _Password2['default'], RegisterStrategy: _Register2['default'], ResetStrategy: _Reset2['default'], FacebookMobileStrategy: _FacebookMobile2['default'] };
module.exports = exports['default'];