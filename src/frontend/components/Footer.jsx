import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/components/Footer.scss';

const Footer = () => (
  <footer className='footer'>
    <Link to='/not-found'>Terminos de uso</Link>
    <Link to='/not-found'>Declaración de privacidad</Link>
    <Link to='/not-found'>Centro de ayuda</Link>
  </footer>
);

export default Footer;
