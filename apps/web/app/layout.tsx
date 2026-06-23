import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthSessionProvider } from '../components/auth/auth-session-context';

export const metadata: Metadata = {
  title: 'Care Desk',
  description: 'Patient management workflow for the case challenge',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
