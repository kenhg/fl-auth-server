'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = configureRoutes;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _lib = require('../lib');

function configureRoutes() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var app = options.app;
  var User = options.User;
  if (!app) throw new Error('[fl-auth] Missing app from configureRoutes, got ' + options);

  // login via ajax
  app.post(options.paths.login, function (req, res, next) {

    _passport2['default'].authenticate('password', function (err, user, info) {
      if (err) return (0, _lib.sendError)(res, err);
      if (!user) return res.status(401).json({ error: 'Incorrect username or password' });

      req.login(user, {}, function (err) {
        if (err) return (0, _lib.sendError)(res, err);

        var access_token = info.access_token;

        return res.json({
          access_token: access_token,
          user: user
        });
      });
    })(req, res, next);
  });

  // register via ajax
  app.post(options.paths.register, function (req, res, next) {

    _passport2['default'].authenticate('register', function (err, user, info) {
      if (err) return (0, _lib.sendError)(res, err);
      if (!user) return res.status(402).json({ error: info });

      req.login(user, {}, function (err) {
        if (err) return (0, _lib.sendError)(res, err);

        var access_token = info.access_token;

        return res.json({
          access_token: access_token,
          user: user
        });
      });
    })(req, res, next);
  });

  // perform password reset
  app.post(options.paths.reset, function (req, res, next) {

    _passport2['default'].authenticate('reset', function (err, user, info) {
      if (err) return (0, _lib.sendError)(res, err);
      if (!user) return res.status(402).json({ error: info });

      req.login(user, {}, function (err) {
        if (err) return (0, _lib.sendError)(res, err);

        var access_token = info.access_token;

        return res.json({
          access_token: access_token,
          user: user
        });
      });
    })(req, res, next);
  });

  // request a reset token to be emailed to a user
  app.post(options.paths.reset_request, function (req, res) {
    var email = req.body.email;
    if (!email) return res.status(400).send({ error: 'No email provided' });

    User.findOne({ email: email }, function (err, user) {
      if (err) return (0, _lib.sendError)(res, err);
      if (!user) return res.status(402).json({ error: 'User not found' });

      user.save({ reset_token: (0, _lib.createToken)(), reset_token_created_at: _moment2['default'].utc().toDate() }, function (err) {
        if (err) return (0, _lib.sendError)(res, err);

        options.sendResetEmail(user, function (err) {
          if (err) return (0, _lib.sendError)(res, err);
          res.status(200).send({});
        });
      });
    });
  });

  // confirm a user's email address
  app.post(options.paths.confirm, function (req, res) {
    var _req$body = req.body;
    var email = _req$body.email;
    var token = _req$body.token;

    if (!email) return res.status(400).send({ error: 'No email provided' });
    if (!token) return res.status(400).send({ error: 'No email confirmation token provided' });

    User.findOne({ email: email, email_confirmation_token: token }, function (err, user) {
      if (err) return (0, _lib.sendError)(res, err);
      if (!user) return res.status(402).json({ error: 'User not found or token is invalid' });

      user.save({ email_confirmation_token: null, email_confirmed_at: _moment2['default'].utc().toDate() }, function (err) {
        if (err) return (0, _lib.sendError)(res, err);
        res.status(200).send({});
      });
    });
  });

  // logout
  app.all('/logout', function (req, res) {
    (0, _lib.logout)(req, function () {
      return res.redirect('/');
    });
  });

  if (options.facebook) {
    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at options.paths.facebook_callback
    app.get(options.facebook.paths.redirect, _passport2['default'].authenticate('facebook', { scope: options.facebook.scope }));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get(options.facebook.paths.callback, _passport2['default'].authenticate('facebook', { successRedirect: '/', failureRedirect: options.paths.login }));
  }
}

module.exports = exports['default'];