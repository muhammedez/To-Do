import { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '../hooks/auth-hook';

export const AuthContext = createContext({ 
  isLoggedIn: false,
  userId: null,
  token: null,
  login: () => {}, 
  logout: () => {} 
});

export const AuthContextProvider = (props) => {
  const { token, login, logout, userId } = useAuthHook();

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, token, userId, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
