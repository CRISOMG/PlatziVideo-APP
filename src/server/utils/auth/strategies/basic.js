const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { API_URL, API_KEY_TOKEN } = process.env;

passport.use(
  // eslint-disable-next-line consistent-return
  new BasicStrategy(async (email, password, cb) => {
    try {
      const auth = {
        password,
        username: email,
      };
      const { data, status } = await axios({
        url: `${API_URL}/api/auth/sign-in`,
        method: 'post',
        auth,
        data: {
          apiKeyToken: API_KEY_TOKEN,
        },
      });
      if (!data || status !== 200) {
        return cb(boom.unauthorized(), false);
      }

      return cb(null, data);
    } catch (error) {
      return cb(error, null);
    }
  }),
);
