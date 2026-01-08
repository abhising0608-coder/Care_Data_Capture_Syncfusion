'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Role, AppUser, AppClaims } from '@/lib/definitions';

// --- Mock User Data ---
const mockUsers: Record<Role, AppUser> = {
    RATING_ANALYST: {
        uid: 'rating.analyst@careedge',
        email: 'analyst@careedge.com',
        displayName: 'Taha G',
        role: 'RATING_ANALYST',
        photoURL: 'https://i.pravatar.cc/150?u=taha'
    },
    GROUP_HEAD: {
        uid: 'group.head@careedge',
        email: 'group.head@careedge.com',
        displayName: 'Group Head',
        role: 'GROUP_HEAD',
        photoURL: 'https://i.pravatar.cc/150?u=gh'
    },
    QC: {
        uid: 'qc@careedge.com',
        email: 'qc@careedge.com',
        displayName: 'QC User',
        role: 'QC',
        photoURL: 'https://i.pravatar.cc/150?u=qc'
    },
    RATING_COMMITTEE: {
        uid: 'cc@careedge.com',
        email: 'cc@careedge.com',
        displayName: 'Care Committee',
        role: 'RATING_COMMITTEE',
        photoURL: 'https://i.pravatar.cc/150?u=cc'
    },
    CKC_ANALYST: { uid: 'ckc.analyst', email: 'ckc.analyst@careedge.com', displayName: 'CKC Analyst', role: 'CKC_ANALYST' },
    CKC_CHECKER: { uid: 'ckc.checker', email: 'ckc.checker@careedge.com', displayName: 'CKC Checker', role: 'CKC_CHECKER' },
    CKC_ADMIN: { uid: 'ckc.admin', email: 'ckc.admin@careedge.com', displayName: 'CKC Admin', role: 'CKC_ADMIN' },
    RATING_HEAD_SD: { uid: 'rh.sd', email: 'rh.sd@careedge.com', displayName: 'Rating Head SD', role: 'RATING_HEAD_SD' },
    SYSTEM: { uid: 'system', email: 'system@careedge.com', displayName: 'System', role: 'SYSTEM' },
    EDITOR: { uid: 'editor@careedge.com', email: 'editor@careedge.com', displayName: 'Editor', role: 'EDITOR' },
    AUDITOR: { uid: 'auditor@careedge.com', email: 'auditor@careedge.com', displayName: 'Auditor', role: 'AUDITOR' },
};


// --- Auth Context Definition ---
interface AuthContextType {
  user: AppUser | null;
  claims: AppClaims | null;
  isLoading: boolean;
  error: Error | null;
  role: Role;
  setUserRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  claims: null,
  isLoading: true,
  error: null,
  role: 'RATING_ANALYST',
  setUserRole: () => {},
});

// --- AuthProvider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [claims, setClaims] = useState<AppClaims | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [role, setRole] = useState<Role>('RATING_ANALYST'); // Default role

  const setUserRole = useCallback((newRole: Role) => {
    setRole(newRole);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // This is a mock auth listener. It sets the user based on the selected role.
    const mockUser = mockUsers[role];
    setUser(mockUser);
    setClaims({ isAdmin: role === 'CKC_ADMIN' });
    setIsLoading(false);
  }, [role]);

  const value = { user, claims, isLoading, error, role, setUserRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook to use the Auth Context ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
