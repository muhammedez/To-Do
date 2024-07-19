import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/auth-hook';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <div className="p-0 flex flex-row items-center justify-between w-full h-11 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-xl px-3 mb-1">
      <h3 className="text-white font-bold text-2xl">TO-DO</h3>
      <ul className="p-0 flex flex-row space-x-14 text-white items-center">
        {!token && (
          <>
            <li>
              <NavLink to="/" className="nav-list">Home</NavLink>
            </li>
            <li>
              <NavLink to="/signup" className="nav-list">Sign Up</NavLink>
            </li>
            <li>
              <NavLink to="/login" className="nav-list">Login</NavLink>
            </li>
          </>
        )}
        {token && (
          <li>
            <button className="nav-list" onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
