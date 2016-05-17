
export default function createInternalAuth(options) {
  const {User, secret} = options
  return (req, res, next) => {
    if (req.query.$auth_secret === secret) {
      delete req.query.$auth_secret
      if (User && req.query.$user_id) {
        let userId
        try {
          userId = JSON.parse(req.query.$user_id)
        }
        catch (err) {
          userId = req.query.$user_id
        }
        return User.findOne(userId, (err, user) => {
          if (err) return res.status(500).send(`[fl-auth] createInternalAuth: Error retrieving $user_id ${req.query.$user_id} ${err.message || err}`)
          if (!user) return res.status(500).send(`[fl-auth] createInternalAuth: Can't find $user_id ${req.query.$user_id}`)
          req.user = user
          delete req.query.$user_id
          next()
        })
      }
      req.user = {id: 'dummy', dummy: true, authBySecret: secret}
      req.user.get = prop => req.user[prop]
      return next()
    }
    next()
  }
}
