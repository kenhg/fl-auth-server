'use strict';

exports.__esModule = true;
exports['default'] = createInternalAuth;

function createInternalAuth(options) {
  var User = options.User;
  var secret = options.secret;

  return function (req, res, next) {
    if (req.query.$auth_secret === secret) {
      delete req.query.$auth_secret;
      if (User && req.query.$user_id) {
        var user_id = undefined;
        try {
          user_id = JSON.parse(req.query.$user_id);
        } catch (err) {
          user_id = req.query.$user_id;
        }
        return User.findOne(user_id, function (err, user) {
          if (err) return res.status(500).send('[fl-auth] createInternalAuth: Error retrieving $user_id ' + req.query.$user_id + ' ' + (err.message || err));
          if (!user) return res.status(500).send('[fl-auth] createInternalAuth: Can\'t find $user_id ' + req.query.$user_id);
          req.user = user.toJSON();
          delete req.query.$user_id;
          next();
        });
      }
      req.user = { id: 'dummy', dummy: true, admin: true, auth_by_secret: secret };
      req.user.get = function (prop) {
        return req.user[prop];
      };
      return next();
    }
    next();
  };
}

module.exports = exports['default'];