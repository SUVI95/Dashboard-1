import React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Switch, Route, Redirect } from 'react-router';
import { connect } from 'react-redux';

import { getHistory } from './index';
import Layout from './components/Layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ErrorPage from './pages/error/ErrorPage';
import CookieConsent from './components/CookieConsent/CookieConsent';
import './styles/app.scss';

const CloseButton = ({ closeToast }) => <i onClick={closeToast} className="la la-close notifications-close-icon"/>

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <ConnectedRouter history={getHistory()}>
          <Switch>
            <Route path="/login" exact component={Login}/>
            <Route path="/register" exact component={Register}/>
            <Route path="/error" exact component={ErrorPage}/>
            <Route path="/" component={Layout}/>
          </Switch>
        </ConnectedRouter>
        <CookieConsent />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(App);
