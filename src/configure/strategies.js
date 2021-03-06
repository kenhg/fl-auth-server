import _ from 'lodash'
import passport from 'passport'
import {Strategy as FacebookStrategy} from 'passport-facebook'
import {Strategy as LinkedInStrategy} from 'passport-linkedin-oauth2'
import {BearerStrategy, PasswordStrategy, RegisterStrategy, ResetStrategy, FacebookMobileStrategy} from '../strategies'

export function configureFacebook(options, strategyOptions) {
  if (!options.facebook.clientId) return console.log('[fl-auth-server] Missing facebook option clientId, got', options.facebook)
  if (!options.facebook.clientSecret) return console.log('[fl-auth-server] Missing facebook option clientSecret, got', options.facebook)

  const User = options.User
  passport.use(new FacebookStrategy({
    clientID: options.facebook.clientId,
    clientSecret: options.facebook.clientSecret,
    callbackURL: options.facebook.url + options.facebook.paths.callback,
    profileFields: options.facebook.profileFields,
  },
  (token, refreshToken, profile, callback) => {
    const email = _.get(profile, 'emails[0].value', '')
    if (!email) return callback(new Error(`[fl-auth] FacebookStrategy: No email from Facebook, got profile: ${JSON.stringify(profile)}`))

    User.findOrCreate({email}, (err, user) => {
      if (err) return callback(err)
      user.save({facebookId: profile.id, name: profile.displayName, facebookAccessToken: token}, callback)
    })
  }))

  passport.use('facebookMobile', new FacebookMobileStrategy(_.extend({}, strategyOptions, {facebook: options.facebook})))
}

export function configureLinkedIn(options) {
  if (!options.linkedin.clientId) console.log('[fl-auth-server] Missing linkedin option clientId, got', options.linkedin)
  if (!options.linkedin.clientSecret) console.log('[fl-auth-server] Missing facebook option clientSecret, got', options.linkedin)

  const User = options.User
  passport.use(new LinkedInStrategy({
    clientID: options.linkedin.clientId,
    clientSecret: options.linkedin.clientSecret,
    callbackURL: options.linkedin.url + options.linkedin.paths.callback,
    profileFields: options.linkedin.profileFields,
    scope: options.linkedin.scope,
    state: true,
  },
  (token, refreshToken, profile, callback) => {
    const email = _.get(profile, 'emails[0].value', '')
    if (!email) return callback(new Error(`[fl-auth] LinkedInStrategy: No email from LinkedIn, got profile: ${JSON.stringify(profile)}`))

    User.findOne({email}, (err, existingUser) => {
      if (err) return callback(err)

      const user = existingUser || new User({email})
      const isNew = !existingUser

      user.save({linkedinId: profile.id, linkedinAccessToken: token}, err => {
        if (err) return callback(err)

        options.linkedin.onLogin(user, profile, isNew, err => {
          if (err) return callback(err)
          callback(null, user)
        })
      })
    })
  }))
}

export default function configureStrategies(options={}) {
  const User = options.User
  if (!User) throw new Error(`[fl-auth] Missing User model from configureStrategies, got ${options}`)

  // passport functions
  const strategyOptions = {User, sendConfirmationEmail: options.sendConfirmationEmail, ...options.login}
  passport.use('password', new PasswordStrategy(strategyOptions))
  passport.use('register', new RegisterStrategy(strategyOptions))
  passport.use('bearer', new BearerStrategy(strategyOptions))
  passport.use('reset', new ResetStrategy(strategyOptions))

  if (options.facebook) configureFacebook(options, strategyOptions)
  if (options.linkedin) configureLinkedIn(options)
}
