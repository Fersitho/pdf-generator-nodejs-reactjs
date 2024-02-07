import React from 'react';
import ErrorImage  from '../../assets/errorPage404.jpg';
import './css.css'
const ErrorPage = () => {
  return (
    <div className="error-page">
      <h1>Oops! La página que buscas no existe.</h1>
      <img src={ErrorImage} alt="Error 404" className="error-image" />
    </div>
  );
};

export default ErrorPage;