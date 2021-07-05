import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';

import './App.scss';
import './styles.scss';

import NavBar from '@components/NavBar/NavBar';
import LandingPage from '@components/LandingPage/LandingPage';

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="main-layout">
          <NavBar />
          <Route path="/" exact component={LandingPage} />
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
