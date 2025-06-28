import { createContext, useContext, useState } from "react";
import { mockUser } from "../mock/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = ({ username, password }) => {
    if (username === mockUser.username && password === mockUser.password) {
      localStorage.setItem("token", mockUser.token);
      setToken(mockUser.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
