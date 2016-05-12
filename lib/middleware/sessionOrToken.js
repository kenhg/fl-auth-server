'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = sessionOrToken;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function sessionOrToken(req, res, next) {
  if (req.isAuthenticated()) return next();

  _passport2['default'].authenticate('bearer', { session: false }, function (err, user) {
    if (err) return res.status(500).send({ error: err });
    if (!user) {
      if (req.method === 'get') return res.redirect(302, '/login?redirectTo=' + req.url);
      return res.status(401).send({ error: 'Unauthorized' });
    }

    req.login(user, {}, function (err) {
      if (err) return res.status(500).send({ error: err });
      next();
    });
  })(req, res, next);
}

//todo: refresh token

// module.exports = (serverAuth, callback) -> return (req, res, next) ->
//   if !req.isAuthenticated or !req.isAuthenticated()
//     requestedUrl = req.originalUrl or req.url

//     queue = new Queue(1)

//     if req.session and (req.session.returnTo isnt requestedUrl)
//       req.session.returnTo = requestedUrl
//       queue.defer (callback) -> req.session.save callback

//     queue.await (err) ->
//      return callback(req, res) if callback
//      res.redirect(302,  `/login?redirectTo=${req.url}`)

//   else
//     # check access token expiry
//     (req.logout(); return res.redirect(302,  `/login?redirectTo=${req.url}`)) unless accessToken = req.session?.accessToken

//     expiresDate = accessToken.expiresDate
//     if expiresDate? and moment().isAfter(expiresDate)
//       vidigami = passport._strategy('vidigami')
//       (req.logout(); return res.redirect(302,  `/login?redirectTo=${req.url}`)) unless vidigami
//       vidigami.refreshToken accessToken.refreshToken, (err, accessToken) ->
//         (req.logout(); return res.redirect(302,  `/login?redirectTo=${req.url}`)) if err or not accessToken?.id
//         req.session.accessToken = accessToken
//         req.session.save (err) -> (console.log('Failed to save access token to session during refresh') if err)
//         next()
//     else next()
module.exports = exports['default'];