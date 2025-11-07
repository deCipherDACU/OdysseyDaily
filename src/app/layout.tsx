'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Poppins, Space_Grotesk } from 'next/font/google';
import { Providers } from '@/app/providers';
import { Fireflies } from '@/components/layout/Fireflies';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});


function AppBody({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isNightMode = user?.preferences?.theme !== 'light';

  return (
      <body className={cn(
        `${poppins.variable} ${spaceGrotesk.variable} font-body antialiased`,
        isNightMode ? 'theme-night' : 'theme-light'
      )} suppressHydrationWarning>
        <>
          {isNightMode && <Fireflies count={15} layer="background" />}
          {children}
          {isNightMode && <Fireflies count={10} layer="midground" />}
          <Toaster />
        </>
      </body>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Providers>
        <AppBody>{children}</AppBody>
      </Providers>
    </html>
  );
}
