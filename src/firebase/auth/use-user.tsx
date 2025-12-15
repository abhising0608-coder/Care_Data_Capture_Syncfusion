'use client';

import { useContext } from 'react';
import {
  FirebaseContext,
  FirebaseContextState,
} from '@/firebase/provider';
import { User } from 'firebase/auth';

// This is the shape of the data returned by the useUser() hook.
export interface UserAuthHookResult {
  user: User | null;
  claims: Record<string, any> | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook to get the current authenticated user's state.
 * It provides the User object, custom claims, loading status, and any auth errors.
 * This hook must be used within a FirebaseProvider.
 * @returns {UserAuthHookResult} - The user's authentication state.
 */
export const useUser = () => {
  // We get the full context, but we will only return user-related state.
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }

  // We are creating a subset of the full context state that is specific to the user.
  // This simplifies the API for components that only need user data.
  const { user, isUserLoading, userError, claims } =
    context;
  return { user, claims, isUserLoading, userError };
};
