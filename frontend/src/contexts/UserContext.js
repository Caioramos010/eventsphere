import React, { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserProfile = async () => {
    if (!AuthService.getCurrentUser()) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userData = await UserService.getUserProfile();
      setUser(userData);
    } catch (err) {
      console.error('Erro ao carregar perfil do usuário:', err);
      setError(err.message);

      if (err.message.includes('Não autorizado')) {
        AuthService.logout();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };
  const updateUser = (userData) => {
    setUser(userData);

    if (userData) {
      AuthService.updateCurrentUser(userData);
    }
  };
  const clearUser = () => {
    setUser(null);
    setError(null);
  };


  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {

        clearUser();
      } else if (e.key === 'token' && e.newValue && !user) {

        loadUserProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  useEffect(() => {

    if (AuthService.getCurrentUser()) {
      loadUserProfile();
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    loadUserProfile,
    updateUser,
    clearUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
