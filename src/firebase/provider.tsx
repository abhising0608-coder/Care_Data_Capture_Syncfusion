
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { Role } from '@/lib/definitions';

// --- Re-integrated AuthContext from the old use-auth.tsx ---
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  photoURL?: string | null;
}

interface AppClaims {
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  claims: AppClaims | null;
  isLoading: boolean;
  error: Error | null;
  role: Role;
  setUserRole: (role: Role) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  claims: null,
  isLoading: true,
  error: null,
  role: 'RATING_ANALYST',
  setUserRole: () => {},
});


// --- Combined FirebaseProvider ---

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

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
};


export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  // --- Auth Logic ---
  const [user, setUser] = useState<AppUser | null>(null);
  const [claims, setClaims] = useState<AppClaims | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [role, setRole] = useState<Role>('RATING_ANALYST'); // Default role

  useEffect(() => {
    setIsAuthLoading(true);
    // This is a mock auth listener. It sets the user based on the selected role.
    const mockUser = mockUsers[role];
    setUser(mockUser);
    setClaims({ isAdmin: role === 'CKC_ADMIN' });
    setIsAuthLoading(false);
  }, [role]); // Rerun effect if role changes

  const setUserRole = (newRole: Role) => {
    setRole(newRole);
  };
  // --- End Auth Logic ---

  const firebaseContextValue = useMemo((): FirebaseContextState => ({
    areServicesAvailable: true,
    firebaseApp,
    firestore,
    auth,
  }), [firebaseApp, firestore, auth]);

  const authContextValue = { user, claims, isLoading: isAuthLoading, error, role, setUserRole };
  
  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      <AuthContext.Provider value={authContextValue}>
        <FirebaseErrorListener />
        {children}
      </AuthContext.Provider>
    </FirebaseContext.Provider>
  );
};


// --- Hooks ---

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider (via FirebaseProvider).');
  }
  return context;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  if (!firestore) throw new Error("Firestore not available");
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  if (!firebaseApp) throw new Error("FirebaseApp not available");
  return firebaseApp;
};

// --- Memoization Hook ---
type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}
