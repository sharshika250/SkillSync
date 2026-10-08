import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const SkillSyncContext = createContext();

export const SkillSyncProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('skillsync_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Invalid saved user data in localStorage:', error);
        localStorage.removeItem('skillsync_user');
      }
    }
    return null; // Unauthenticated by default: never falls back to mock Jane Doe
  });

  const [partners, setPartners] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);

  // Sync profile data from backend whenever user is logged in
  const refreshProfile = async () => {
    if (!currentUser?.id && !currentUser?._id) return;
    try {
      setLoadingUser(true);
      const res = await userAPI.getProfile();
      if (res?.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('skillsync_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('Could not refresh profile from server:', err.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('skillsync_user', JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('skillsync_user');
    setExchangeRequests([]);
  };

  const updateUser = (updatedData) => {
    setCurrentUser(updatedData);
    localStorage.setItem('skillsync_user', JSON.stringify(updatedData));
  };

  // Helper to find partner by ID (supports string and ObjectId)
  const getPartnerById = (id) => {
    return partners.find(p => String(p.id || p._id) === String(id));
  };

  return (
    <SkillSyncContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        updateUser,
        refreshProfile,
        loadingUser,
        partners,
        setPartners,
        exchangeRequests,
        setExchangeRequests,
        getPartnerById
      }}
    >
      {children}
    </SkillSyncContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSkillSync = () => {
  const context = useContext(SkillSyncContext);
  if (!context) {
    throw new Error('useSkillSync must be used within a SkillSyncProvider');
  }
  return context;
};
