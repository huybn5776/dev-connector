import React from 'react';

import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';

import './App.scss';

import LandingPage from '@components/LandingPage/LandingPage';
import LoginPage from '@components/LoginPage/LoginPage';
import NavBar from '@components/NavBar/NavBar';
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
            <Route path="/" exact component={LandingPage} />
            <Route path="/login" exact component={LoginPage} />
            <UnauthenticatedRoute path="/register" exact component={RegisterPage} fallbackTo="/dashboard" />
          </div>
        </BrowserRouter>
      </div>
    </Provider>
  );
};

export default App;
