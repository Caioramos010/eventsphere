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
  const [loading, setLoading] = useState(true); // loading começa como true
  const [error, setError] = useState(null);

  const loadUserProfile = async () => {
    setLoading(true); // sempre começa carregando
    setError(null);
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await UserService.getUserProfile();
      setUser(userData);
    } catch (err) {
      console.error('Erro ao carregar perfil do usuário:', err);
      setError(err.message);
      setUser(null);
      if (err.message && err.message.includes('Não autorizado')) {
        AuthService.logout();
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
    setLoading(false);
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
    loadUserProfile();
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
