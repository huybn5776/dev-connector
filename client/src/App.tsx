import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';

import './App.scss';
import './styles.scss';

import HomePage from '@components/HomePage/HomePage';

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Route path="/" exact component={HomePage}/>
      </BrowserRouter>
    </div>
  );
};

export default App;
