import React, { useState, useRef } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUser } from "../actions";
import '../assets/styles/components/Login.scss';
import Header from '../components/Header';
import googleIcon from '../assets/static/google-icon.png';
import twitterIcon from '../assets/static/twitter-icon.png';

const Login = props => {
  const [form, setValues] = useState({
    email: '',
    rememberMe: false
  });

  const updateInput = event => {
    setValues({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const rememberMe = useRef(false)

  const setRememberMe = event => {
    setValues({
      ...form,
      rememberMe: rememberMe.current.checked
    })
  }

  const handleSubmit = event => {
    event.preventDefault();
    props.loginUser(form, '/');
  }

  return (
    <>
      <Header isLogin />
      <section className="login">
        <section className="login__container">
          <h2>Inicia sesión</h2>
          <form className="login__container--form" onSubmit={handleSubmit}>
            <input
              name="email"
              className="input"
              type="text"
              placeholder="Correo"
              onChange={updateInput}
            />
            <input
              name="password"
              className="input"
              type="password"
              placeholder="Contraseña"
              onChange={updateInput}
            />
            <button className="button" type="submit">Iniciar sesión</button>
            <div className="login__container--remember-me">
              <label htmlFor="first_checkbox">
                <input type="checkbox" ref={rememberMe} onClick={setRememberMe} />
                Recuérdame
              </label>
              <a href="/">Olvidé mi contraseña</a>
            </div>
          </form>
          <section className="login__container--social-media">
            <div>
              <img src={googleIcon} alt="Google" />
              {' '}
              Inicia sesión con Google
            </div>
            <div>
              <img src={twitterIcon} alt="Twitter" />
              {' '}
              Inicia sesión con Twitter
            </div>
          </section>
          <p className="login__container--register">
            No tienes ninguna cuenta
            {' '}
            <Link to="/register">
              Regístrate
            </Link>
          </p>
        </section>
      </section>
    </>
  );
}

const mapDispatchToProps = {
  loginUser,
};

Login.propTypes = {
  loginUser: PropTypes.func,
};

export default connect(null, mapDispatchToProps)(Login);
