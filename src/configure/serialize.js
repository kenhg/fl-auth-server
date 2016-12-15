import passport from 'passport'

export default function configureSerializing(options={}) {
  const User = options.User
  if (!User) throw new Error(`[fl-auth] Missing User model from configureSerializing, got ${options}`)

  // serialize users to their id
  passport.serializeUser(options.serializing.serializeUser || ((user, callback) => {
    if (!user) return callback(new Error('[fl-auth] User missing'))
    callback(null, user.id)
  }))

  passport.deserializeUser(options.serializing.deserializeUser || ((id, callback) => User.cursor({id, $one: true}).toJSON(callback)))
}
