
## [Unreleased]
  

## [0.10.0]
 - Code style switched to camelCase for variables. 
 - Frameworkstein initial release.

## [0.4.0]
 - Public release

## [0.3.2]
 - Register / login responses include all fields on the user model (except password)

## [0.3.1]
 - internalAuth can look up specific users now. It accepts a `User` argument, a user model class. If provided and `req.query.$user_id` is present on a request that user will be looked up. `req.user` will then be set to this user instance instead of the dummy user.

## [0.3.0]
 - Email confirmation is sent on registration. Configure the email sending via the sendConfirmationEmail option

## [0.2.0]
 - Extra params for registration can be configured. Authorised middleware delegates more to the canAccess option
