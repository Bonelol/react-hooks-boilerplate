import React from 'react';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import '@resource/css/base.css';
import history from './history';
import Layout from '@components/Layout/index';
import Home from '@pages/Home/index';
import Debug from '@pages/Debug/index';
import NotFound from '@pages/NotFound/index';
import Foo from '@pages/Foo/index';

const App = () => (
  <Router history={history}>
    <Layout>
      <Switch>
        <Redirect exact from="/" to="/home" />
        <Route path="/foo" component={Foo} />
        <Route path="/debug" component={Debug} />
        <Route path="/home" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  </Router>
);
export default App;
