import _ from 'lodash'

const defaults = {
  unauthorised_message: 'Unauthorised',
}

export default function createAuthMiddleware(options) {
  _.merge(options, defaults)
  if (!options.canAccess) throw new Error(`[fl-auth] createAuthMiddleware: Missing options.canAccess. Got options: ${JSON.stringify(options)}`)

  return function authorised(req, res, next) {
    if (!req.isAuthenticated()) return res.status(401).send({error: options.unauthorised_message})

    options.canAccess({user: req.user, req, res}, (err, authorised) => {
      if (err) return res.status(500).send({error: err})
      if (!authorised) return res.status(401).send({error: options.unauthorised_message})
      next()
    })
  }
}
