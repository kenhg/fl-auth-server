
export default function createInternalAuth(options) {
  const {User, secret} = options
  return (req, res, next) => {
    if (req.query.$auth_secret === secret) {
      delete req.query.$auth_secret
      if (User && req.query.$user_id) {
        let user_id
        try {
          user_id = JSON.parse(req.query.$user_id)
        }
        catch (err) {
          user_id = req.query.$user_id
        }
        return User.findOne(user_id, (err, user) => {
          if (err) return res.status(500).send(`[fl-auth] createInternalAuth: Error retrieving $user_id ${req.query.$user_id} ${err.message || err}`)
          if (!user) return res.status(500).send(`[fl-auth] createInternalAuth: Can't find $user_id ${req.query.$user_id}`)
          req.user = user.toJSON()
          delete req.query.$user_id
          next()
        })
      }
      req.user = {id: 'dummy', dummy: true, admin: true, auth_by_secret: secret}
      req.user.get = prop => req.user[prop]
      return next()
    }
    next()
  }
}
