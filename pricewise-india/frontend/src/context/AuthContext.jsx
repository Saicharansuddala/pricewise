import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [city, setCity] = useState(localStorage.getItem('pricewise_city') || 'Mumbai');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pricewise_token') || null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    localStorage.setItem('pricewise_city', city);
  }, [city]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('pricewise_token', token);
      fetchApi('/auth/me', { token })
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(err => {
          console.error("Auth hydration error:", err);
          logout();
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      setIsLoaded(true);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, userCity) => {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: { name, email, password, city: userCity || city }
    });
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pricewise_token');
  };

  const getToken = async () => token;

  const value = {
    city,
    setCity,
    user,
    token,
    isLoaded,
    isSignedIn: !!user,
    login,
    register,
    logout,
    getToken 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Main replacement for Clerk's useAuth 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility or secondary alias
export const useAppAuthContext = useAuth;
