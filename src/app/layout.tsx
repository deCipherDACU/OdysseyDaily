
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { Providers } from '@/app/providers';
import { Fireflies } from '@/components/layout/Fireflies';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

function AppBody({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isNightMode = user?.preferences?.theme !== 'light';

  return (
      <body className={cn(
        `${inter.variable} font-display antialiased`,
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <Providers>
            <AppBody>{children}</AppBody>
        </Providers>
    </html>
  );
}
