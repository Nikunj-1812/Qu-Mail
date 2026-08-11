'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginPayload, SignupPayload } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  passphrase: string;
  isLoading: boolean;
  isHydrating: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  setPassphrase: (pass: string) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string>('');
  // isLoading = only true during active API calls (login/signup)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // isHydrating = true while restoring session from localStorage on first render
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('qm_token');
      const storedUser = localStorage.getItem('qm_user');
      const storedPass = localStorage.getItem('qm_passphrase');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedPass) setPassphrase(storedPass);
      }
    } catch (e) {
      console.error('Failed to restore auth from localStorage', e);
    } finally {
      setIsHydrating(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(payload);
      setToken(data.access);
      setUser(data.user);
      setPassphrase(payload.password);

      localStorage.setItem('qm_token', data.access);
      localStorage.setItem('qm_refresh', data.refresh);
      localStorage.setItem('qm_user', JSON.stringify(data.user));
      localStorage.setItem('qm_passphrase', payload.password);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.signup(payload);
      setToken(data.access);
      setUser(data.user);
      setPassphrase(payload.password);

      localStorage.setItem('qm_token', data.access);
      localStorage.setItem('qm_refresh', data.refresh);
      localStorage.setItem('qm_user', JSON.stringify(data.user));
      localStorage.setItem('qm_passphrase', payload.password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setPassphrase('');
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_refresh');
    localStorage.removeItem('qm_user');
    localStorage.removeItem('qm_passphrase');
  }, []);

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const u = await authApi.getMe(token);
      setUser(u);
      localStorage.setItem('qm_user', JSON.stringify(u));
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        passphrase,
        isLoading,
        isHydrating,
        login,
        signup,
        logout,
        setPassphrase,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
