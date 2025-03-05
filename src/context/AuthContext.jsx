import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('/api/auth/user');
        setUser(res.data);
      } catch (err) {
        console.error('Not authenticated', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (tokenId) => {
    try {
      const res = await axios.post('/api/auth/google', { token: tokenId });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/profile', profileData);
      setUser({ ...user, ...res.data });
      return res.data;
    } catch (err) {
      console.error('Profile update failed', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};