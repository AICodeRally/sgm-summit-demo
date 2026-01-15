/**
 * AICR Health Check Service
 *
 * Provides connectivity status for AICR-dependent components.
 * Components should gracefully disable when AICR is unavailable.
 */

const AICR_API_BASE = process.env.NEXT_PUBLIC_AICR_API_BASE || 'https://app.aicoderally.com';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 second timeout

export interface AIServiceHealth {
  available: boolean;
  lastChecked: Date | null;
  error?: string;
}

export interface AIHealthStatus {
  aicr: AIServiceHealth;
  pulse: AIServiceHealth;
  asksgm: AIServiceHealth;
}

// Cache for health status
let healthCache: AIHealthStatus = {
  aicr: { available: false, lastChecked: null },
  pulse: { available: false, lastChecked: null },
  asksgm: { available: false, lastChecked: null },
};

let healthCheckPromise: Promise<AIHealthStatus> | null = null;

/**
 * Check if AICR platform is reachable
 */
async function checkAICRHealth(): Promise<AIServiceHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`${AICR_API_BASE}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    return {
      available: response.ok,
      lastChecked: new Date(),
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      available: false,
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check if Pulse API is available
 */
async function checkPulseHealth(): Promise<AIServiceHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    // Try a lightweight ping to the pulse endpoint
    const response = await fetch(`${AICR_API_BASE}/api/pulse?tenantId=health-check&limit=0`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    // Consider 4xx as "service exists but no data" = available
    // Only 5xx or network errors mean unavailable
    const available = response.status < 500;

    return {
      available,
      lastChecked: new Date(),
      error: available ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      available: false,
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check if AskSGM API is available
 */
async function checkAskSGMHealth(): Promise<AIServiceHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    // Check local AskSGM endpoint
    const response = await fetch('/api/ai/asksgm', {
      method: 'OPTIONS',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    return {
      available: response.status !== 500,
      lastChecked: new Date(),
    };
  } catch (error) {
    // Local API should always be available if server is running
    return {
      available: true,
      lastChecked: new Date(),
    };
  }
}

/**
 * Get current health status (cached)
 */
export function getHealthStatus(): AIHealthStatus {
  return healthCache;
}

/**
 * Check all AI service health (with deduplication)
 */
export async function checkAllHealth(): Promise<AIHealthStatus> {
  // Deduplicate concurrent calls
  if (healthCheckPromise) {
    return healthCheckPromise;
  }

  healthCheckPromise = (async () => {
    const [aicr, pulse, asksgm] = await Promise.all([
      checkAICRHealth(),
      checkPulseHealth(),
      checkAskSGMHealth(),
    ]);

    healthCache = { aicr, pulse, asksgm };
    return healthCache;
  })();

  try {
    return await healthCheckPromise;
  } finally {
    healthCheckPromise = null;
  }
}

/**
 * Check if a specific service is available
 */
export async function isServiceAvailable(service: keyof AIHealthStatus): Promise<boolean> {
  const cached = healthCache[service];

  // If we have a recent check (within interval), use cache
  if (cached.lastChecked) {
    const age = Date.now() - cached.lastChecked.getTime();
    if (age < HEALTH_CHECK_INTERVAL) {
      return cached.available;
    }
  }

  // Otherwise, refresh health status
  const status = await checkAllHealth();
  return status[service].available;
}

/**
 * Quick sync check - returns cached status without network call
 * Use this for initial render decisions
 */
export function isServiceAvailableSync(service: keyof AIHealthStatus): boolean {
  return healthCache[service].available;
}
