'use strict';

exports.__esModule = true;
exports['default'] = createInternalMiddleware;

var noop = function noop(req, res, next) {
  return next();
};

function createInternalMiddleware(options) {
  var User = options.User;
  var secret = options.secret;
  var deserializeUser = options.deserializeUser;

  if (!(User || deserializeUser)) {
    console.error('[fl-auth] createInternalMiddleware requires a User or deserializeUser option');
    return noop;
  }

  var getUser = deserializeUser || function (userId, callback) {
    return User.findOne(userId, callback);
  };

  return function (req, res, next) {

    if (!req.query.$auth_secret) return noop;
    if (req.query.$auth_secret !== secret) {
      console.error('[fl-auth] createInternalMiddleware: Non-matching $auth_secret supplied on query - ', req.query.$auth_secret);
      return noop;
    }
    delete req.query.$auth_secret;

    if (!req.query.$user_id) return noop;

    var userId = undefined;
    try {
      userId = JSON.parse(req.query.$user_id);
    } catch (err) {
      userId = req.query.$user_id;
    }

    getUser(userId, function (err, user) {
      if (err) return res.status(500).send('[fl-auth] createInternalMiddleware: Error retrieving $user_id ' + req.query.$user_id + ' ' + (err.message || err));
      if (!user) return res.status(500).send('[fl-auth] createInternalMiddleware: Can\'t find $user_id ' + req.query.$user_id);
      req.user = user;
      delete req.query.$user_id;
      next();
    });
  };
}

module.exports = exports['default'];