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
  setUserRole?: (role: Role) => void; // Make optional as it's part of mock logic
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  claims: null,
  isLoading: true,
  error: null,
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
  const [role, setRole] = useState<Role>('CKC_ANALYST'); // Default to CKC_ANALYST

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // In a real app, you might fetch custom claims here.
        // For this prototype, we'll assign a role and derive claims.
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'analyst@careedge.com',
          displayName: firebaseUser.displayName || 'Taha G',
          role: role, // Use the state-managed role
          photoURL: firebaseUser.photoURL || 'https://i.pravatar.cc/150?u=taha'
        };
        const appClaims: AppClaims = {
          isAdmin: role === 'CKC_ADMIN',
        };
        setUser(appUser);
        setClaims(appClaims);
      } else {
        // Handle user being logged out
        const mockUser: AppUser = {
          uid: 'mock-user-123',
          email: 'analyst@careedge.com',
          displayName: 'Taha G',
          role: role,
          photoURL: 'https://i.pravatar.cc/150?u=taha'
        };
        const mockClaims: AppClaims = {
          isAdmin: role === 'CKC_ADMIN',
        };
        setUser(mockUser);
        setClaims(mockClaims);
      }
      setIsAuthLoading(false);
    }, (error) => {
      setError(error);
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, role]); // Rerun effect if auth instance or role changes

  const setUserRole = (newRole: Role) => {
    setIsAuthLoading(true);
    setRole(newRole);
  };
  // --- End Auth Logic ---

  const firebaseContextValue = useMemo((): FirebaseContextState => ({
    areServicesAvailable: true,
    firebaseApp,
    firestore,
    auth,
  }), [firebaseApp, firestore, auth]);

  const authContextValue = { user, claims, isLoading: isAuthLoading, error, setUserRole };
  
  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      <AuthContext.Provider value={authContextValue}>
        <FirebaseErrorListener />
        {!isAuthLoading ? children : null /* Or a global loader */}
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
