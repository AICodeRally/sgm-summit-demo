'use client';

import { useState, useEffect, useCallback } from 'react';
import { AIHealthStatus, checkAllHealth, getHealthStatus } from './health';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Hook to monitor AI service health
 * Components use this to auto-hide when their backend is unavailable
 */
export function useServiceHealth() {
  const [health, setHealth] = useState<AIHealthStatus>(getHealthStatus);
  const [isChecking, setIsChecking] = useState(false);

  const refreshHealth = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const status = await checkAllHealth();
      setHealth(status);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  useEffect(() => {
    // Initial health check
    refreshHealth();

    // Periodic health checks
    const interval = setInterval(refreshHealth, HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshHealth]);

  return {
    health,
    isChecking,
    refreshHealth,
    // Convenience getters
    isAICRAvailable: health.aicr.available,
    isPulseAvailable: health.pulse.available,
    isAskSGMAvailable: health.asksgm.available,
  };
}

/**
 * Hook for a specific service
 */
export function useServiceAvailable(service: keyof AIHealthStatus): boolean {
  const { health } = useServiceHealth();
  return health[service].available;
}
