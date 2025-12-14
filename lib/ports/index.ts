/**
 * Ports Index
 *
 * Export all port interfaces for dependency injection.
 * Ports define service contracts without implementation details.
 */

// Policy Port
export * from './policy.port';

// Territory Port
export * from './territory.port';

// Approval Port
export * from './approval.port';

// Audit Port
export * from './audit.port';

// Link Port (ConnectItem pattern)
export * from './link.port';

// Search Port (IndexItem pattern)
export * from './search.port';
