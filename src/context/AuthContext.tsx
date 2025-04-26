
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple static password check (replace with a more secure method if needed)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "estrelas123"; // Use environment variable or default
const SESSION_STORAGE_KEY = 'estrelas_admin_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start loading until session is checked

  useEffect(() => {
    // Check session storage on initial load
    const storedAuth = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false); // Finished checking session
  }, []);

  const login = async (password: string): Promise<boolean> => {
    setLoading(true);
    // Simulate async operation if needed
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true'); // Store auth state
      setLoading(false);
      return true;
    } else {
      setIsAuthenticated(false);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clear auth state
     // Optionally redirect or perform other cleanup
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
