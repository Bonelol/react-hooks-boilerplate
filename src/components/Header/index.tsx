import React from 'react';
import cx from 'classnames';

import { Props } from 'src/types';

import './index.scss';

const Header = (props: Props) => (
  <header className={cx(props.className, 'header')}>
    <div className="header-content"></div>
  </header>
);

export default Header;
