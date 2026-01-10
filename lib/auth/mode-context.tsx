'use client';

/**
 * Mode Context Provider
 *
 * Provides operational mode context to client components
 * Allows mode switching via API calls
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { OperationalMode, ModeContext } from '@/types/operational-mode';
import { getModePermission } from './mode-permissions';

const ModeContextValue = createContext<ModeContext | undefined>(undefined);

interface ModeProviderProps {
  children: React.ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
  const { data: session, update } = useSession();

  const currentMode = session?.user?.currentMode ?? null;
  const availableModes = session?.user?.availableModes ?? [];
  const canSwitchMode = availableModes.length > 1;

  /**
   * Switch to a different operational mode
   * Updates the session via API call
   */
  const switchMode = useCallback(
    async (mode: OperationalMode) => {
      if (!session?.user) {
        throw new Error('No active session');
      }

      // Check if user has access to target mode
      const permission = getModePermission(session.user.role, mode);
      if (!permission.canAccess) {
        throw new Error(`You don't have access to ${mode} mode`);
      }

      try {
        // Call API to update mode in session
        const response = await fetch('/api/auth/mode/switch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode }),
        });

        if (!response.ok) {
          throw new Error('Failed to switch mode');
        }

        // Update session on client side
        await update({
          ...session,
          user: {
            ...session.user,
            currentMode: mode,
          },
        });

        // Redirect to mode's default route
        window.location.href = getModeDefaultRoute(mode);
      } catch (error) {
        console.error('Error switching mode:', error);
        throw error;
      }
    },
    [session, update]
  );

  const value: ModeContext = {
    currentMode,
    availableModes,
    canSwitchMode,
    switchMode,
  };

  return (
    <ModeContextValue.Provider value={value}>
      {children}
    </ModeContextValue.Provider>
  );
}

/**
 * Hook to access mode context
 */
export function useMode(): ModeContext {
  const context = useContext(ModeContextValue);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

/**
 * Hook to check if a specific mode is available
 */
export function useModeAvailable(mode: OperationalMode): boolean {
  const { availableModes } = useMode();
  return availableModes.includes(mode);
}

/**
 * Hook to check if currently in a specific mode
 */
export function useIsMode(mode: OperationalMode): boolean {
  const { currentMode } = useMode();
  return currentMode === mode;
}

/**
 * Hook to get mode permission details
 */
export function useModePermission(mode: OperationalMode) {
  const { data: session } = useSession();
  if (!session?.user?.role) {
    return {
      canAccess: false,
      canSwitch: false,
      accessLevel: 'none' as const,
    };
  }
  return getModePermission(session.user.role, mode);
}

/**
 * Get default route for a mode
 */
function getModeDefaultRoute(mode: OperationalMode): string {
  switch (mode) {
    case OperationalMode.DESIGN:
      return '/design';
    case OperationalMode.OPERATE:
      return '/operate';
    case OperationalMode.DISPUTE:
      return '/dispute';
    case OperationalMode.OVERSEE:
      return '/oversee';
    default:
      return '/';
  }
}
