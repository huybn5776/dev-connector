import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';

import './App.scss';

import LandingPage from '@components/LandingPage/LandingPage';
import NavBar from '@components/NavBar/NavBar';
import RegisterPage from '@components/RegisterPage/RegisterPage';

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="main-layout">
          <NavBar />
          <Route path="/" exact component={LandingPage} />
          <Route path="/register" exact component={RegisterPage} />
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
