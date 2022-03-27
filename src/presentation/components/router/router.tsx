import React from 'react';
import { Login } from '@/presentation/pages';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/login">
          <Login />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
