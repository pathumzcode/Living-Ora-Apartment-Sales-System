import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('livingora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => user?.role || 'EXTERNAL_USER');
  const [token, setToken] = useState(() => localStorage.getItem('livingora_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('livingora_user', JSON.stringify(user));
      if (user.role) {
        setRole(user.role);
      }
    } else {
      localStorage.removeItem('livingora_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('livingora_token', token);
    } else {
      localStorage.removeItem('livingora_token');
    }
  }, [token]);

  const switchRole = (newRole) => setRole(newRole);

  const completeAuth = (response) => {
    if (!response?.token) throw new Error('The server did not return a login token');
    const loggedUser = {
      uid: response.uid,
      empId: response.uid,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      externalUser: response.externalUser,
      isCustomer: response.customer,
      isSalesAgent: response.salesAgent,
      status: response.status || 'Verified',
      name: `${response.firstName || ''} ${response.lastName || ''}`.trim()
    };
    setToken(response.token);
    setUser(loggedUser);
    setRole(loggedUser.role);
    return { success: true, user: loggedUser };
  };

  const login = async (email, password) => completeAuth(await authApi.login({ email, password }));

  const signup = async (details) => completeAuth(await authApi.signup(details));

  const logout = () => {
    setUser(null);
    setRole('GUEST');
    setToken(null);
    localStorage.removeItem('livingora_user');
    localStorage.removeItem('livingora_token');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, switchRole, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
