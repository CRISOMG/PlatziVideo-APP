/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* eslint-disable global-require */
import express from 'express';
import helmet from 'helmet';
import webpack, { WebpackOptionsValidationError } from 'webpack';
import React from 'react';

import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import passport from 'passport';
import cookieParser from 'cookie-parser';
import boom from '@hapi/boom';
import axios from 'axios';

import cors from 'cors';
import debug from 'debug';
import reducer from '../frontend/reducers';
import Layout from '../frontend/components/Layout';
import serverRoutes from '../frontend/routes/serverRoutes';
import getManifest from './getManifest';

import { config } from './config';

const app = express();

app.use(express.json());
app.use(cookieParser('secret'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

require('./utils/auth/strategies/basic');

if (config.env === 'development') {
  const webPackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webPackConfig);
  const serverConfig = { port: config.port, hot: true };
  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use((req, res, next) => {
    req.hashManifest = getManifest();
    next();
  });
  app.use(express.static(`${__dirname}/public`));
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.disable('x-powered-by');
}

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest['main.css'] : '/assets/app.css';
  const mainBuild = manifest ? manifest['main.js'] : '/assets/app.js';
  const vendorBuild = manifest ? manifest['vendors.js'] : 'assets/vendor.js';
  return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <meta charset="utf-8" />
          <link rel="stylesheet" href="${mainStyles}" type="text/css"/>
          <title>PlatziVideo</title>
          </head>
          <body>
          <div id="app">${html}</div>
            <script id="preloadedState">
            window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
            </script>
            <script src="${mainBuild}" type="text/javascript"></script>
            <script src="${vendorBuild}" type="text/javascript"></script>
          </body>
      </html>`;
};

const renderApp = async (req, res) => {
  let initialState;
  const { token, email, name, id } = req.cookies;

  try {
    const { data: platziMovies } = await axios({
      url: `${config.apiUrl}/api/movies`,
      headers: { authorization: `Bearer ${token}` },
    });

    initialState = {
      user: {
        email,
        name,
        id,
      },
      myList: [],
      trends: platziMovies.data.filter((movie) => movie.contentRating === 'PG' && movie._id),
      originals: platziMovies.data.filter((movie) => movie.contentRating === 'G' && movie._id),
      playing: {},
    };
  } catch (error) {
    initialState = {
      user: {},
      myList: [],
      trends: [],
      originals: [],
    };
  }

  const store = createStore(reducer, initialState);
  const preloadedState = store.getState();
  const isLogged = initialState.user.id;
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        <Layout>{renderRoutes(serverRoutes(isLogged))}</Layout>
      </StaticRouter>
    </Provider>,
  );

  res.send(setResponse(html, preloadedState, req.hashManifest));
};

// autenticacion

app.post('/auth/sign-in', async function (req, res, next) {
  passport.authenticate('basic', function (err, data) {
    try {
      if (err || !data) {
        return next(boom.unauthorized());
      }

      req.login(data, { session: false }, async function (error) {
        if (error) {
          return next(error);
        }

        const { token, ...user } = data;

        console.log(data);

        if (!token) throw new Error('Data not have token');

        res.cookie('token', token, {
          httpOnly: !(config.env === 'development'),
          secure: !(config.env === 'development'),
        });

        res.status(200).json(user);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

app.post('/auth/sign-up', async function (req, res, next) {
  const { body: user } = req;

  try {
    const userData = await axios({
      url: `${config.apiUrl}/api/auth/sign-up`,
      method: 'post',
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
      },
    });

    res.status(201).json({
      name: req.body.name,
      email: req.body.email,
      id: userData.id,
    });
  } catch (error) {
    next(error);
  }
});

// // Google OAuth
// require('./utils/auth/strategies/oauth');

// app.get(
//   '/auth/google-oauth',
//   passport.authenticate('google-oauth', {
//     scope: ['email', 'profile', 'openid'],
//   })
// );

// app.get(
//   '/auth/google-oauth/callback',
//   passport.authenticate('google-oauth', {
//     session: false,
//     successRedirect: '/',
//   }),
//   function (req, res, next) {
//     if (!req.user) {
//       next(boom.unauthorized());
//     }

//     const { token, ...user } = req.user;

//     res.cookie('token', token, {
//       httpOnly: !(config.env === 'development'),
//       secure: !(config.env === 'development'),
//     });

//     res.status(200).json(user);
//   }
// );

// Google Strategies
require('./utils/auth/strategies/google');

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile', 'openid'],
  }),
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    // successRedirect: '/',
  }),
  function (req, res, next) {
    if (!req.user) {
      next(boom.unauthorized());
    }

    const { token, user } = req.user;

    res.cookie('token', token, {
      httpOnly: !(config.env === 'development'),
      secure: !(config.env === 'development'),
    });

    res.cookie('id', user.id);
    res.cookie('name', user.name);
    res.cookie('email', user.email);
    res.redirect('/');
  },
);

// peliculas del usuario

app.get('/user-movies', async function (req, res, next) {
  try {
    const { token, id } = req.cookies;

    const {
      data: { data: movieList },
      status,
    } = await axios({
      url: `${config.apiUrl}/api/user-movies?userId=${id}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    res.status(status).json({
      data: movieList,
      message: 'user movies listed',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/user-movies/:movieId', async function (req, res, next) {
  try {
    const { movieId } = req.params;
    const { token } = req.cookies;

    const { data: movie, status } = await axios({
      url: `${config.apiUrl}/api/movies/${movieId}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    res.status(status).json({
      movie: movie.data,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/user-movies', async function (req, res, next) {
  try {
    const { movieId } = req.body;
    const { token, id: userId } = req.cookies;

    const userMovie = {
      userId,
      movieId,
    };

    const { data, status } = await axios({
      url: `${config.apiUrl}/api/user-movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'post',
      data: userMovie,
    });

    if (status !== 201) {
      return next(boom.badImplementation());
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

app.delete('/user-movies/:userMovieId', async function (req, res, next) {
  try {
    const { userMovieId } = req.params;
    const { token } = req.cookies;

    const { data, status } = await axios({
      url: `${config.apiUrl}/api/user-movies/${userMovieId}`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'delete',
    });

    if (status !== 200) {
      return next(boom.badImplementation());
    }

    res.status(status).json({
      id: data.data,
      message: data.message,
    });
  } catch (error) {
    next(error);
  }
});

app.get('*', renderApp);

const debugServer = debug('app:server');
const debugError = debug('app:error');

app.use(function (error, req, res, next) {
  debugError(error.message);

  res.status(error.output.statusCode).json(error.message);
});

app.listen(config.port, (err) => {
  if (err) debugError(err);
  else debugServer(`${config.env} server running on Port ${config.port}`);
});
