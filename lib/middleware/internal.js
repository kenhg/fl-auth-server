'use strict';

exports.__esModule = true;
exports['default'] = createInternalMiddleware;

function createInternalMiddleware(options) {
  var User = options.User;
  var secret = options.secret;
  var deserializeUser = options.deserializeUser;

  if (!(User || deserializeUser)) {
    console.error('[fl-auth] createInternalMiddleware requires a User or deserializeUser option');
    return function (req, res, next) {
      return next();
    };
  }

  var getUser = deserializeUser || function (id, callback) {
    return User.cursor({ id: id, $one: true }).toJSON(callback);
  };

  return function (req, res, next) {

    if (!req.query.$auth_secret) return next();
    if (req.query.$auth_secret !== secret) {
      console.error('[fl-auth] createInternalMiddleware: Non-matching $auth_secret supplied on query - ', req.query.$auth_secret);
      return next();
    }
    delete req.query.$auth_secret;

    if (!req.query.$user_id) return next();

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