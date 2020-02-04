import React from 'react';

import Header from '@components/Header';
import Footer from '@components/Footer';

import { Props } from 'src/types';

import './index.scss';

const Layout = (props: Props) => (
  <>
    <Header />
    <main className="layout">
      <div className="layout-main">{props.children}</div>
    </main>
    <Footer />
  </>
);

export default Layout;
