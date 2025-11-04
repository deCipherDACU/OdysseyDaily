
// src/firebase/auth/use-user.tsx
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export function useUser() {
  const { auth } = useAuth();
  // Initialize user state to null to avoid error when auth is not ready
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only subscribe to auth changes if the auth object is available
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      // Cleanup subscription on component unmount
      return () => unsubscribe();
    } else {
      // If auth is not ready, we are not loading a user.
      setLoading(false);
    }
  }, [auth]);

  return { user, loading };
}
