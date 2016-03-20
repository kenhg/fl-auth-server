import _ from 'lodash'
import passport from 'passport'
import {Strategy as FacebookStrategy} from 'passport-facebook'
import {Strategy as LinkedInStrategy} from 'passport-linkedin-oauth2'
import {BearerStrategy, PasswordStrategy, RegisterStrategy, ResetStrategy} from '../strategies'

export default function configureStrategies(options={}) {
  const User = options.User
  if (!User) throw new Error(`[fl-auth] Missing User model from configureStrategies, got ${options}`)

  // passport functions
  const strategy_options = {User, sendConfirmationEmail: options.sendConfirmationEmail, ...options.login}
  passport.use('password', new PasswordStrategy(strategy_options))
  passport.use('register', new RegisterStrategy(strategy_options))
  passport.use('bearer', new BearerStrategy(strategy_options))
  passport.use('reset', new ResetStrategy(strategy_options))

  if (options.facebook && options.facebook.app_id && options.facebook.app_secret) {
    passport.use(new FacebookStrategy({
      clientID: options.facebook.app_id,
      clientSecret: options.facebook.app_secret,
      callbackURL: options.facebook.url + options.facebook.paths.callback,
      profileFields: options.facebook.profile_fields,
    },

    (token, refresh_token, profile, callback) => {
      const email = _.get(profile, 'emails[0].value', '')
      if (!email) return callback(new Error(`[fl-auth] FacebookStrategy: No email from Facebook, got profile: ${JSON.stringify(profile)}`))

      User.findOrCreate({email}, (err, user) => {
        if (err) return callback(err)
        user.save({facebook_id: profile.id, name: profile.displayName, facebook_access_token: token}, callback)
      })

    }))
  }

  if (options.linkedin && options.linkedin.app_id && options.linkedin.app_secret) {
    passport.use(new LinkedInStrategy({
      clientID: options.linkedin.app_id,
      clientSecret: options.linkedin.app_secret,
      callbackURL: options.linkedin.url + options.linkedin.paths.callback,
      profileFields: options.linkedin.profile_fields,
      scope: options.linkedin.scope,
      state: true,
    },

    (token, refresh_token, profile, callback) => {
      console.log('linkedin profile', profile)
      const email = _.get(profile, 'emails[0].value', '')
      if (!email) return callback(new Error(`[fl-auth] LinkedInStrategy: No email from LinkedIn, got profile: ${JSON.stringify(profile)}`))

      User.findOrCreate({email}, (err, user) => {
        if (err) return callback(err)

        user.save({linkedin_id: profile.id, linkedin_access_token: token}, err => {
          if (err) return callback(err)

          options.linkedin.onUserCreated(user, profile, err => {
            if (err) return callback(err)
            callback(null, user)
          })
        })
      })

    }))
  }

}
