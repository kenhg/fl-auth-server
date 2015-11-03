'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _local = require('./local');

var _local2 = _interopRequireDefault(_local);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var ResetStrategy = (function (_LocalStrategy) {
  _inherits(ResetStrategy, _LocalStrategy);

  function ResetStrategy() {
    _classCallCheck(this, ResetStrategy);

    _get(Object.getPrototypeOf(ResetStrategy.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ResetStrategy, [{
    key: 'verify',
    value: function verify(req, email, password, callback) {
      var _this = this;

      var User = this.User;

      var reset_token = req.body.reset_token;

      if (!reset_token) return callback(null, null, 'No token provided');

      User.findOne({ reset_token: reset_token }, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback(null, null, 'No user found with this token');

        if (_moment2['default'].utc().diff((0, _moment2['default'])(user.get('reset_token_created_at'))) > _this.reset_token_expires_ms) callback(null, null, 'This token has expired');

        user.save({
          password: User.createHash(password),
          reset_token: null,
          reset_token_created_at: null
        }, callback);
      });
    }
  }]);

  return ResetStrategy;
})(_local2['default']);

exports['default'] = ResetStrategy;
module.exports = exports['default'];