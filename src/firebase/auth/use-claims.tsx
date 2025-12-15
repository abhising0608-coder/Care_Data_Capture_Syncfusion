'use client';

import { useState, useEffect } from 'react';
import { useUser } from './use-user';
import { IdTokenResult } from 'firebase/auth';

export interface AppClaims {
  isAdmin?: boolean;
  [key: string]: any;
}

export const useClaims = () => {
  const { user } = useUser();
  const [claims, setClaims] = useState<AppClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setClaims(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    user.getIdTokenResult()
      .then((idTokenResult: IdTokenResult) => {
        if (isMounted) {
          setClaims(idTokenResult.claims as AppClaims);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          console.error("Error fetching user claims:", err);
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { claims, loading, error };
};
