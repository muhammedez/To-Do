import React, { Suspense } from 'react';
import {
  Route,
  Routes,
  Navigate
} from 'react-router-dom';

import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';

import './index.css'

const Navbar = React.lazy(() => import('./components/navigation/NavBar.jsx'));
const Homepage = React.lazy(() => import('./pages/Homepage'));
const Register = React.lazy(() => import('./pages/Register'));
const Login = React.lazy(() => import('./pages/Login'));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="*" element={<Navigate to="/" />} /> 
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} /> 
      </Routes>
    );
  }

  return (
    <AuthContext.Provider  value={{ isLoggedIn: !!token, token, userId, login, logout }}>
        <Suspense fallback={<div className='text-8xl'>Loading...</div>}>
          <Navbar />
          <main>
              {routes}
          </main>
        </Suspense>
    </AuthContext.Provider>
);
};

export default App;
