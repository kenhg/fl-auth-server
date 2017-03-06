'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _Local = require('./Local');

var _Local2 = _interopRequireDefault(_Local);

var ResetStrategy = (function (_LocalStrategy) {
  _inherits(ResetStrategy, _LocalStrategy);

  function ResetStrategy() {
    _classCallCheck(this, ResetStrategy);

    _LocalStrategy.apply(this, arguments);
  }

  ResetStrategy.prototype.verify = function verify(req, email, password, callback) {
    var _this = this;

    var User = this.User;

    var resetToken = req.body.resetToken;

    if (!resetToken) return callback(null, null, 'No token provided');

    User.findOne({ email: email, resetToken: resetToken }, function (err, user) {
      if (err) return callback(err);
      if (!user) return callback(null, null, 'No user found with this token');

      if (_moment2['default'].utc().diff(_moment2['default'](user.get('resetTokenCreatedDate'))) > _this.resetTokenExpiresMs) callback(null, null, 'This token has expired');

      user.save({
        password: User.createHash(password),
        resetToken: null,
        resetTokenCreatedDate: null
      }, callback);
    });
  };

  return ResetStrategy;
})(_Local2['default']);

exports['default'] = ResetStrategy;
module.exports = exports['default'];