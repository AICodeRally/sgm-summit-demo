import { NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';

/**
 * GET /api/sgm/diagnostics
 *
 * Returns diagnostic information about the SGM system:
 * - Binding mode configuration
 * - Provider status
 * - Data availability
 */
export async function GET() {
  try {
    const registry = getRegistry();
    const diagnostics = registry.getDiagnostics();

    // Test each provider
    const policyProvider = registry.getPolicy();
    const territoryProvider = registry.getTerritory();
    const approvalProvider = registry.getApproval();
    const auditProvider = registry.getAudit();
    const linkProvider = registry.getLink();
    const searchProvider = registry.getSearch();

    // Get data counts
    const tenantId = 'demo-tenant-001';

    const [
      policiesCount,
      territoriesCount,
      approvalsCount,
      linksCount,
      searchItemsCount,
    ] = await Promise.all([
      policyProvider.findAll({ tenantId }).then((r) => r.length),
      territoryProvider.findAll({ tenantId }).then((r) => r.length),
      approvalProvider.findAll({ tenantId }).then((r) => r.length),
      linkProvider.findAll({ tenantId }).then((r) => r.length),
      searchProvider.count(tenantId),
    ]);

    return NextResponse.json(
      {
        status: 'ok',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT || 3003,
          appName: process.env.APP_NAME || 'SGM Summit Demo',
          appTier: process.env.APP_TIER || 'summit',
        },
        architecture: {
          pattern: 'Contracts + Ports + Bindings',
          bindingMode: diagnostics.providers.policy, // All providers use same mode in default config
          hasExternalDependencies: diagnostics.hasExternalDependencies,
        },
        providers: {
          policy: diagnostics.providers.policy,
          territory: diagnostics.providers.territory,
          approval: diagnostics.providers.approval,
          audit: diagnostics.providers.audit,
          link: diagnostics.providers.link,
          search: diagnostics.providers.search,
        },
        data: {
          tenantId,
          counts: {
            policies: policiesCount,
            territories: territoriesCount,
            approvals: approvalsCount,
            links: linksCount,
            searchItems: searchItemsCount,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
