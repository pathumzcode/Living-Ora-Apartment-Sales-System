import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AnyUser, RoleType } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { authApi } from '../services/api';

interface AuthContextType {
  user: AnyUser | null;
  role: RoleType;
  token: string | null;
  switchRole: (newRole: 'EXTERNAL_USER' | 'INTERNAL_STAFF') => void;
  login: (email: string, password: string, isStaff?: boolean) => Promise<{ success: boolean; user?: any; isDemo?: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnyUser | null>(() => {
    const saved = localStorage.getItem('livingora_user');
    return saved ? (JSON.parse(saved) as AnyUser) : MOCK_USERS.customer;
  });

  const [role, setRole] = useState<RoleType>(() =>
    (user as AnyUser & { role: RoleType })?.role ?? 'EXTERNAL_USER'
  );

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('livingora_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('livingora_user', JSON.stringify(user));
      if ('role' in user) setRole((user as any).role as RoleType);
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

  const switchRole = (newRole: 'EXTERNAL_USER' | 'INTERNAL_STAFF'): void => {
    if (newRole === 'EXTERNAL_USER') {
      setUser(MOCK_USERS.customer);
      setRole('EXTERNAL_USER');
    } else {
      setUser(MOCK_USERS.staff);
      setRole('INTERNAL_STAFF');
    }
  };

  const login = async (email: string, password: string, isStaff = false): Promise<{ success: boolean; user?: any; isDemo?: boolean }> => {
    try {
      const response = await authApi.login({ email, password, isStaff });
      if (response && response.token) {
        setToken(response.token);
        const loggedUser = {
          uid: response.uid,
          email: response.email,
          role: response.role || (isStaff ? 'INTERNAL_STAFF' : 'EXTERNAL_USER'),
          status: response.status || 'Verified',
          name: response.email.split('@')[0]
        };
        setUser(loggedUser as any);
        setRole(loggedUser.role as RoleType);
        return { success: true, user: loggedUser };
      }
    } catch (err: any) {
      console.warn('Backend login error, using fallback demo credentials:', err?.message);
    }

    const demoUser = isStaff ? { ...MOCK_USERS.staff, email } : { ...MOCK_USERS.customer, email };
    setUser(demoUser as any);
    setRole(demoUser.role as RoleType);
    setToken('demo-jwt-token');
    return { success: true, user: demoUser, isDemo: true };
  };

  const logout = (): void => {
    setUser(null);
    setRole('GUEST');
    setToken(null);
    localStorage.removeItem('livingora_user');
    localStorage.removeItem('livingora_token');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
