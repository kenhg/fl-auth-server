
export default function createInternalAuth(options) {
  const {secret} = options
  return (req, res, next) => {
    if (req.query.$auth_secret === secret) req.user = {dummy: true, admin: true, auth_by_secret: secret}
    next()
  }
}
