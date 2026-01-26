'use client';

import { ThemeProvider } from 'next-themes';
import { GeolocationProvider } from '@/lib/GeolocationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GeolocationProvider>
      <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
        {children}
      </ThemeProvider>
    </GeolocationProvider>
  );
}
