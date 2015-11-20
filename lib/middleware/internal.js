'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createInternalAuth;

function createInternalAuth(options) {
  var secret = options.secret;

  console.log('making auth', options);
  return function (req, res, next) {
    if (req.query.$auth_secret === secret) req.user = { dummy: true, superuser: true, auth_by_secret: secret };
    next();
  };
}

module.exports = exports['default'];