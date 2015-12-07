'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createAuthMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var defaults = {
  unauthorised_message: 'Unauthorised'
};

function createAuthMiddleware(options) {
  _lodash2['default'].merge(options, defaults);
  if (!options.canAccess) throw new Error('[fl-auth] createAuthMiddleware: Missing options.canAccess. Got options: ' + JSON.stringify(options));

  return function authorised(req, res, next) {
    options.canAccess({ user: req.user, req: req, res: res }, function (err, authorised, message) {
      if (err) return res.status(500).send({ error: err });
      if (!authorised) return res.status(401).send({ error: message || options.unauthorised_message });
      next();
    });
  };
}

module.exports = exports['default'];