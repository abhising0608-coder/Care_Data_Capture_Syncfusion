'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock user and claims structure
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AppClaims {
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  claims: AppClaims | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock auth provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<AppClaims | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate fetching user data
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Mocked user data. In a real app, this would come from an auth session.
      const mockUser: User = {
        uid: 'mock-user-123',
        email: 'analyst@careedge.com',
        displayName: 'CKC Analyst',
      };
      
      const mockClaims: AppClaims = {
        isAdmin: false, // Change this to true to test admin views
      };

      setUser(mockUser);
      setClaims(mockClaims);
      setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  const value = { user, claims, isLoading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
