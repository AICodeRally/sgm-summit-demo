import React, { type ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export type RallyAuthConfig = Record<string, any>;

export async function buildNextAuthConfig(config: RallyAuthConfig, prisma?: unknown) {
  // Transform Rally providers to NextAuth providers
  const providers = [];

  if (config.providers?.credentials) {
    providers.push(
      CredentialsProvider({
        name: config.providers.credentials.name || 'Credentials',
        credentials: config.providers.credentials.credentials,
        authorize: config.providers.credentials.authorize,
      })
    );
  }

  if (config.providers?.google) {
    providers.push(
      GoogleProvider({
        clientId: config.providers.google.clientId,
        clientSecret: config.providers.google.clientSecret,
        authorization: {
          params: {
            access_type: config.providers.google.accessType,
            prompt: config.providers.google.prompt,
          },
        },
      })
    );
  }

  if (config.providers?.github) {
    providers.push(
      GitHubProvider({
        clientId: config.providers.github.clientId,
        clientSecret: config.providers.github.clientSecret,
      })
    );
  }

  return {
    providers,
    session: config.session,
    pages: config.pages,
    callbacks: config.callbacks,
    events: config.events,
    debug: config.debug,
    ...(prisma ? { adapter: undefined } : {}),
  } as Record<string, any>;
}

export function useRallySession() {
  return useSession();
}

export function RallySessionProvider({ children }: { children: ReactNode }) {
  return React.createElement(SessionProvider, null, children);
}
