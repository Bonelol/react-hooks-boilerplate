import React from 'react';
import { Link } from 'react-router-dom';

import './index.scss';

const NotFound = () => (
  <div className="notfound">
    <h3 className="notfound-title">404</h3>
    <p>
      Not Found
      <Link to="/" className="notfound-home">
        Return
      </Link>
    </p>
  </div>
);

export default NotFound;
