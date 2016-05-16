'use strict';

exports.__esModule = true;
exports['default'] = createInternalAuth;

function createInternalAuth(options) {
  var User = options.User;
  var secret = options.secret;

  console.log('created', options);
  return function (req, res, next) {
    console.log('processing', req.query.$auth_secret, secret, req.query.$auth_secret === secret);
    if (req.query.$auth_secret === secret) {
      delete req.query.$auth_secret;
      console.log('User && req.query.$user_id', User, req.query.$user_id);
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
      req.user = { id: 'dummy', dummy: true, authBySecret: secret };
      req.user.get = function (prop) {
        return req.user[prop];
      };
      return next();
    }
    next();
  };
}

module.exports = exports['default'];