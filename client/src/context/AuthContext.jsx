// Authors:
// Derek Long - 261161918


// Create a Global Authenticator to stay logged in when visiting 'About Us' page
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { token, role, email? } or null

  // Rehydrate auth state from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('mcbook-token');
    const role = localStorage.getItem('mcbook-role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  const login = (token, role) => {
    localStorage.setItem('mcbook-token', token);
    localStorage.setItem('mcbook-role', role);
    setUser({ token, role });
  };

  const logout = () => {
    localStorage.removeItem('mcbook-token');
    localStorage.removeItem('mcbook-role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}