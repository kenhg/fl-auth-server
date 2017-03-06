'use strict';

exports.__esModule = true;
exports['default'] = createAuthMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var defaults = {
  unauthorisedMessage: 'Unauthorised'
};

function createAuthMiddleware(options) {
  _lodash2['default'].merge(options, defaults);
  if (!options.canAccess) throw new Error('[fl-auth] createAuthMiddleware: Missing options.canAccess. Got options: ' + JSON.stringify(options));

  return function authorised(req, res, next) {
    options.canAccess({ user: req.user, req: req, res: res }, function (err, authorised, message) {
      if (err) return res.status(500).send({ error: err });
      if (!authorised) return res.status(401).send({ error: message || options.unauthorisedMessage });
      next();
    });
  };
}

module.exports = exports['default'];