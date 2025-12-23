'use client';

import { RallySessionProvider } from '@rally/auth';
import { ReactNode } from 'react';

/**
 * App Providers - Client-side providers wrapper
 *
 * Wraps the app with Rally SessionProvider (enhanced NextAuth) and any other client-side providers.
 */
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <RallySessionProvider>{children}</RallySessionProvider>;
}
