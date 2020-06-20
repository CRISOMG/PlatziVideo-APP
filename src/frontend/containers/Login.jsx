/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUser, loginWithGoogle } from '../actions';
import '../assets/styles/components/Login.scss';
import Header from '../components/Header';
import googleIcon from '../assets/static/google-icon.png';
// import twitterIcon from '../assets/static/twitter-icon.png';

const Login = (props) => {
  const [form, setValues] = useState({
    email: '',
    rememberMe: false,
  });

  const updateInput = (event) => {
    setValues({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const rememberMe = useRef(false);

  const setRememberMe = () => {
    setValues({
      ...form,
      rememberMe: rememberMe.current.checked,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    props.loginUser(form, '/');
  };

  const handleLoginWithGoogle = async () => {
    console.log('handleLoginWithGoogle');
    // props.loginWithGoogle();

    window.location.href = '/auth/google';

    // window.open(
    //   '/auth/google',
    //   'Google Authentication',
    //   'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=500,height=600'
    // );
  };

  return (
    <>
      <Header isLogin />
      <section className='login'>
        <section className='login__container'>
          <h2>Inicia sesión</h2>
          <form className='login__container--form' onSubmit={handleSubmit}>
            <input
              name='email'
              className='input'
              type='text'
              placeholder='Correo'
              onChange={updateInput}
            />
            <input
              name='password'
              className='input'
              type='password'
              placeholder='Contraseña'
              onChange={updateInput}
            />
            <button className='button' type='submit'>
              Iniciar sesión
            </button>
            {/* <div className='login__container--remember-me'>
              <label htmlFor='first_checkbox'>
                <input
                  type='checkbox'
                  ref={rememberMe}
                  onClick={setRememberMe}
                />
                Recuérdame
              </label>
              <a href='/'>Olvidé mi contraseña</a>
            </div> */}
          </form>
          <section className='login__container--social-media'>
            <div
              className='social--login_google'
              onClick={handleLoginWithGoogle}
            >
              <img
                src={googleIcon}
                alt='Google'
                onClick={handleLoginWithGoogle}
              />
              <a>Inicia sesión con Google</a>
            </div>
            <div className='social--login_twitter'>
              {/* <div className='g-signin2' data-onsuccess='onSignIn' /> */}
              {/* <img src={twitterIcon} alt='Twitter' />
              <p>Inicia sesión con Twitter</p> */}
            </div>
          </section>
          <p className='login__container--register'>
            No tienes ninguna cuenta <Link to='/register'>Regístrate</Link>
          </p>
        </section>
      </section>
    </>
  );
};

const mapDispatchToProps = {
  loginUser,
  loginWithGoogle,
};

Login.propTypes = {
  loginUser: PropTypes.func,
  loginWithGoogle: PropTypes.func,
};

export default connect(null, mapDispatchToProps)(Login);
