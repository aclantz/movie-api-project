const jwtSecret = 'your_jwt_secret'; //must match key used in the JWTStrategy in passport file

const jwt = require('jsonwebtoken'),
passport = require('passport');

/**
 * local passport file
 */
require('./passport'); 

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

/**
 * Login endpoint
 * POST /login
 * @summary allow a registered user to login, retrieving a token and user data
 * @param {string} username
 * @param {string} password
 * @return {JSON} user object, token
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
          return res.status(400).json({
            message: 'Something is not right',
            user: user
          });
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            res.send(error);
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token });
        });
      })(req, res);
    });
  }