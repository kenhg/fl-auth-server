'use strict';

exports.__esModule = true;
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
      if (err) return _lib.sendError(res, err);
      if (!user) return res.status(401).json({ error: 'Incorrect username or password' });

      req.login(user, {}, function (err) {
        if (err) return _lib.sendError(res, err);

        var accessToken = info.accessToken;

        return res.json({
          accessToken: accessToken,
          user: user
        });
      });
    })(req, res, next);
  });

  // register via ajax
  app.post(options.paths.register, function (req, res, next) {

    _passport2['default'].authenticate('register', function (err, user, info) {
      if (err) return _lib.sendError(res, err);
      if (!user) return res.status(402).json({ error: info });

      req.login(user, {}, function (err) {
        if (err) return _lib.sendError(res, err);

        var accessToken = info.accessToken;

        return res.json({
          accessToken: accessToken,
          user: user
        });
      });
    })(req, res, next);
  });

  // perform password reset
  app.post(options.paths.reset, function (req, res, next) {

    _passport2['default'].authenticate('reset', function (err, user, info) {
      if (err) return _lib.sendError(res, err);
      if (!user) return res.status(402).json({ error: info });

      req.login(user, {}, function (err) {
        if (err) return _lib.sendError(res, err);

        var accessToken = info.accessToken;

        return res.json({
          accessToken: accessToken,
          user: user
        });
      });
    })(req, res, next);
  });

  // request a reset token to be emailed to a user
  app.post(options.paths.resetRequest, function (req, res) {
    var email = req.body.email;
    if (!email) return res.status(400).send({ error: 'No email provided' });

    User.findOne({ email: email }, function (err, user) {
      if (err) return _lib.sendError(res, err);
      if (!user) return res.status(402).json({ error: 'User not found' });

      user.save({ resetToken: _lib.createToken(), resetTokenCreatedDate: _moment2['default'].utc().toDate() }, function (err) {
        if (err) return _lib.sendError(res, err);

        options.sendResetEmail(user, function (err) {
          if (err) return _lib.sendError(res, err);
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

    User.findOne({ email: email, emailConfirmationToken: token }, function (err, user) {
      if (err) return _lib.sendError(res, err);

      if (!user) {
        return User.exists({ email: email, emailConfirmedDate: { $lt: _moment2['default'].utc().toDate() } }, function (err, exists) {
          if (err) return _lib.sendError(res, err);
          if (!exists) res.status(402).json({ error: 'User not found or token is invalid' });
          res.status(200).send({});
        });
      }

      user.save({ emailConfirmationToken: null, emailConfirmedDate: _moment2['default'].utc().toDate() }, function (err) {
        if (err) return _lib.sendError(res, err);
        res.status(200).send({});
      });
    });
  });

  // logout
  app.all(options.paths.logout, function (req, res) {
    _lib.logout(req, function () {
      return res.redirect('/');
    });
  });

  // status
  app.get(options.paths.loginStatus, function (req, res) {
    var user = req.user ? { id: req.user.id } : null;
    res.json({ user: user });
  });

  if (options.facebook) {
    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at options.paths.facebook_callback
    app.get(options.facebook.paths.redirect, options.setReturnTo, _passport2['default'].authenticate('facebook', { scope: options.facebook.scope }));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get(options.facebook.paths.callback, _passport2['default'].authenticate('facebook', { successRedirect: options.paths.success, failureRedirect: options.paths.login }));

    app.post(options.facebook.paths.mobile, function (req, res, next) {
      _passport2['default'].authenticate('facebookMobile', function (err, user, info) {
        if (err) return _lib.sendError(res, err);
        if (!user) return res.status(402).json({ error: info });

        req.login(user, {}, function (err) {
          if (err) return _lib.sendError(res, err);

          var accessToken = info.accessToken;

          return res.json({
            accessToken: accessToken,
            user: user
          });
        });
      })(req, res, next);
    });
  }

  if (options.linkedin) {
    app.get(options.linkedin.paths.redirect, options.setReturnTo, _passport2['default'].authenticate('linkedin'));
    app.get(options.linkedin.paths.callback, _passport2['default'].authenticate('linkedin', { successRedirect: options.paths.success, failureRedirect: options.paths.login }));
  }
}

module.exports = exports['default'];