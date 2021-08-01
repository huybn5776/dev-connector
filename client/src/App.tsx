import React from 'react';

import { Provider } from 'react-redux';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import './App.scss';

import AuthenticatedRoute from '@components/AuthenticatedRoute/AuthenticatedRoute';
import DashboardPage from '@components/DashboardPage/DashboardPage';
import EditEducationPage from '@components/EditEducationPage/EditEducationPage';
import EditExperiencePage from '@components/EditExperiencePage/EditExperiencePage';
import EditProfilePage from '@components/EditProfilePage/EditProfilePage';
import LandingPage from '@components/LandingPage/LandingPage';
import LoginPage from '@components/LoginPage/LoginPage';
import NavBar from '@components/NavBar/NavBar';
import ProfilesPage from '@components/ProfilesPage/ProfilesPage';
import ProfileViewPage from '@components/ProfileViewPage/ProfileViewPage';
import RegisterPage from '@components/RegisterPage/RegisterPage';
import UnauthenticatedRoute from '@components/UnauthenticatedRoute/UnauthenticatedRoute';
import store from '@store';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <div className="main-layout">
            <NavBar />
            <Switch>
              <Route path="/" exact component={LandingPage} />
              <Route path="/login" exact component={LoginPage} />
              <UnauthenticatedRoute path="/register" exact component={RegisterPage} fallbackTo="/dashboard" />
              <AuthenticatedRoute path="/dashboard" exact component={DashboardPage} />
              <AuthenticatedRoute path="/edit-profile" exact component={EditProfilePage} />
              <AuthenticatedRoute path="/add-experience" exact render={() => <EditExperiencePage />} />
              <AuthenticatedRoute path="/edit-experience/:id?" exact render={() => <EditExperiencePage edit />} />
              <AuthenticatedRoute path="/add-education" exact render={() => <EditEducationPage />} />
              <AuthenticatedRoute path="/edit-education/:id?" exact render={() => <EditEducationPage edit />} />
              <Route path="/profiles" exact component={ProfilesPage} />
              <Route path="/profiles/:id" exact component={ProfileViewPage} />
              <Redirect to="/" />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    </Provider>
  );
};

export default App;
