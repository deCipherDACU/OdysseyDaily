
'use client';

import { UserProvider } from '@/context/UserContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </FirebaseClientProvider>
  );
}
