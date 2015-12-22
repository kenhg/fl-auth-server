'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _local = require('./local');

var _local2 = _interopRequireDefault(_local);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var ResetStrategy = (function (_LocalStrategy) {
  _inherits(ResetStrategy, _LocalStrategy);

  function ResetStrategy() {
    _classCallCheck(this, ResetStrategy);

    _LocalStrategy.apply(this, arguments);
  }

  ResetStrategy.prototype.verify = function verify(req, email, password, callback) {
    var _this = this;

    var User = this.User;

    var reset_token = req.body.reset_token;

    if (!reset_token) return callback(null, null, 'No token provided');

    User.findOne({ email: email, reset_token: reset_token }, function (err, user) {
      if (err) return callback(err);
      if (!user) return callback(null, null, 'No user found with this token');

      if (_moment2['default'].utc().diff(_moment2['default'](user.get('reset_token_created_at'))) > _this.reset_token_expires_ms) callback(null, null, 'This token has expired');

      user.save({
        password: User.createHash(password),
        reset_token: null,
        reset_token_created_at: null
      }, callback);
    });
  };

  return ResetStrategy;
})(_local2['default']);

exports['default'] = ResetStrategy;
module.exports = exports['default'];