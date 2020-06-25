import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import CloudflareStream from './pages/CloudflareStream';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/stream">
            <CloudflareStream />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
