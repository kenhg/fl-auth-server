
export default function createInternalAuth(options) {
  const {secret} = options
  return (req, res, next) => {
    if (req.query.$auth_secret === secret) req.user = {dummy: true, superuser: true, auth_by_secret: secret}
    next()
  }
}
