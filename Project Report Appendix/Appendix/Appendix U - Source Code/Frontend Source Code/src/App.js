
import React from 'react';
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  ReactQueryDevtools
} from 'react-query/devtools';

import {
  useAuthState
} from "react-firebase-hooks/auth";

import './App.css';

import { auth } from './Utils/utilities';

import SignUp from './Components/SignUp/SignUp';
import MainControlPanel from './Components/MainControlPanel/MainControlPanel';
import NotFound from './Components/NotFound/NotFound';

const App = () => {
  const queryClient = new QueryClient();
  const [user, loading, error] = useAuthState(auth);

  const PrivateRoute = ({ component: Component, userId, ...rest }) => {
    return (
      <Route {...rest} render={(props) => {
        return user
          ? <Component {...props} userId={userId} />
          : <Redirect to='/signup' />
      }} />
    )
  };

  const LoggedInUserRouter = ({ component: Component, userId, ...rest }) => {
    return (
      <Route {...rest} render={(props) => {
        return !user
          ? <Component {...props} userId={userId} />
          : <Redirect to='/' />
      }} />
    )
  };

  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <LoggedInUserRouter path='/signup' component={SignUp} />
          <PrivateRoute exact path='/'>
            <Redirect to='/home' />
          </PrivateRoute>
          <PrivateRoute path='/home' component={MainControlPanel} />
          <Route component={NotFound} />
        </Switch>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </React.Fragment>
  );
}

export default App;
