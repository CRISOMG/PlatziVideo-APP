/* eslint-disable func-names */
const passport = require('passport');
const axios = require('axios');
const boom = require('@hapi/boom');
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
const debug = require('debug');

const debugAuth = debug('app:auth');
const { config } = require('../../../config');

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: 'https://platzivideo-cris.herokuapp.com/auth/google/callback',
    },
    async function (_accessToken, refreshToken, profile, cb) {
      debugAuth('GoogleStrategy:', _accessToken, 'Profile:', profile);

      const { data, status } = await axios({
        url: `${config.apiUrl}/api/auth/sign-provider`,
        method: 'post',
        data: {
          name: profile.displayName,
          email: profile._json.email,
          password: profile.id,
          apiKeyToken: config.apiKeyToken,
        },
      });

      debugAuth('/api/auth/sign-provider data:', data);

      if (!data || status !== 200) {
        return cb(boom.unauthorized(), false);
      }

      return cb(null, data);
    },
  ),
);
