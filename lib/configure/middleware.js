'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = configureMiddleware;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function configureMiddleware() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var app = options.app;
  if (!app) throw new Error('[fl-auth] Missing app from configureMiddleware, got ' + options);

  if (options.middleware.initialize) app.use(_passport2['default'].initialize());
  if (options.middleware.session) app.use(_passport2['default'].session());
}

module.exports = exports['default'];