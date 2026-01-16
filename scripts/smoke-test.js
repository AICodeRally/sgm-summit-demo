#!/usr/bin/env node
/**
 * SGM Summit Demo - Smoke Test
 *
 * Visits all routes in the application and reports any failures.
 * Uses the dev server to test page loads.
 *
 * Usage:
 *   node scripts/smoke-test.js [--url=http://localhost:4200] [--json]
 *
 * Options:
 *   --url=<base_url>  Base URL of the app (default: http://localhost:4200)
 *   --json            Output results as JSON
 *   --skip-dynamic    Skip dynamic routes like [id], [tenantSlug]
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const BASE_URL = args.find(a => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:4200';
const JSON_OUTPUT = args.includes('--json');
const SKIP_DYNAMIC = args.includes('--skip-dynamic');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Find all page routes
function findAllRoutes() {
  const appDir = path.join(process.cwd(), 'app');
  const routes = [];

  function isRouteGroup(segment) {
    return segment.startsWith('(') && segment.endsWith(')');
  }

  function walkDir(dir, routeParts = []) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      if (item.name.startsWith('.') || item.name === 'node_modules') continue;

      if (item.isDirectory()) {
        const segment = item.name;
        const newRouteParts = isRouteGroup(segment) ? routeParts : [...routeParts, segment];
        walkDir(path.join(dir, segment), newRouteParts);
      } else if (item.name === 'page.tsx' || item.name === 'page.js') {
        const route = routeParts.length === 0 ? '/' : '/' + routeParts.join('/');
        routes.push(route);
      }
    }
  }

  walkDir(appDir);
  return routes.sort();
}

// Test a single route
async function testRoute(route, retries = 2) {
  const url = `${BASE_URL}${route}`;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      const duration = Date.now() - startTime;

      // Check for redirect to login (expected for protected routes)
      if (response.url.includes('/auth/signin') || response.url.includes('/api/auth')) {
        return {
          route,
          url,
          status: 'auth_redirect',
          statusCode: response.status,
          duration,
          message: 'Redirected to auth (expected)',
        };
      }

      // Check for success
      if (response.ok) {
        return {
          route,
          url,
          status: 'pass',
          statusCode: response.status,
          duration,
        };
      }

      // Server error
      if (response.status >= 500) {
        if (attempt < retries) continue; // Retry
        return {
          route,
          url,
          status: 'error',
          statusCode: response.status,
          duration,
          message: `Server error: ${response.status}`,
        };
      }

      // Client error (404, etc.)
      return {
        route,
        url,
        status: response.status === 404 ? 'not_found' : 'client_error',
        statusCode: response.status,
        duration,
        message: `HTTP ${response.status}`,
      };

    } catch (error) {
      if (attempt < retries) continue; // Retry
      return {
        route,
        url,
        status: 'fail',
        duration: Date.now() - startTime,
        message: error.name === 'AbortError' ? 'Timeout' : error.message,
      };
    }
  }
}

// Main smoke test
async function runSmokeTest() {
  const allRoutes = findAllRoutes();

  // Filter out dynamic routes if requested
  const routes = SKIP_DYNAMIC
    ? allRoutes.filter(r => !r.includes('['))
    : allRoutes;

  // Replace dynamic segments with test values
  const testRoutes = routes.map(route => {
    return route
      .replace('[tenantSlug]', 'demo-tenant-001')
      .replace('[id]', '1')
      .replace('[planCode]', 'PLAN-001')
      .replace('[route]', encodeURIComponent('/plans'));
  });

  if (!JSON_OUTPUT) {
    console.log('\n' + colors.cyan + '========================================' + colors.reset);
    console.log(colors.cyan + '  SGM Summit Demo - Smoke Test' + colors.reset);
    console.log(colors.cyan + '========================================' + colors.reset);
    console.log(`${colors.dim}Base URL: ${BASE_URL}${colors.reset}`);
    console.log(`${colors.dim}Routes to test: ${testRoutes.length}${colors.reset}`);
    console.log(colors.cyan + '----------------------------------------' + colors.reset + '\n');
  }

  const results = [];
  const startTime = Date.now();

  for (const route of testRoutes) {
    const result = await testRoute(route);
    results.push(result);

    if (!JSON_OUTPUT) {
      const icon = result.status === 'pass' ? colors.green + '✓' :
                   result.status === 'auth_redirect' ? colors.yellow + '→' :
                   colors.red + '✗';
      const duration = `${colors.dim}(${result.duration}ms)${colors.reset}`;
      const message = result.message ? ` ${colors.dim}- ${result.message}${colors.reset}` : '';
      console.log(`  ${icon}${colors.reset} ${route} ${duration}${message}`);
    }
  }

  const totalDuration = Date.now() - startTime;

  // Summarize results
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    authRedirect: results.filter(r => r.status === 'auth_redirect').length,
    errors: results.filter(r => ['error', 'fail'].includes(r.status)).length,
    notFound: results.filter(r => r.status === 'not_found').length,
    duration: totalDuration,
    timestamp: new Date().toISOString(),
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify({ summary, results }, null, 2));
  } else {
    console.log('\n' + colors.cyan + '----------------------------------------' + colors.reset);
    console.log(colors.cyan + '  Summary' + colors.reset);
    console.log(colors.cyan + '----------------------------------------' + colors.reset);
    console.log(`  Total routes:     ${summary.total}`);
    console.log(`  ${colors.green}Passed:${colors.reset}           ${summary.passed}`);
    console.log(`  ${colors.yellow}Auth redirect:${colors.reset}    ${summary.authRedirect}`);
    console.log(`  ${colors.red}Errors:${colors.reset}           ${summary.errors}`);
    console.log(`  Not found:        ${summary.notFound}`);
    console.log(`  Duration:         ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(colors.cyan + '========================================' + colors.reset + '\n');

    // List errors if any
    const errorResults = results.filter(r => ['error', 'fail'].includes(r.status));
    if (errorResults.length > 0) {
      console.log(colors.red + 'Errors:' + colors.reset);
      for (const err of errorResults) {
        console.log(`  ${colors.red}✗${colors.reset} ${err.route}: ${err.message}`);
      }
      console.log('');
    }

    // Exit with error code if there were failures
    if (summary.errors > 0) {
      console.log(colors.red + '❌ Smoke test FAILED' + colors.reset);
      process.exit(1);
    } else {
      console.log(colors.green + '✅ Smoke test PASSED' + colors.reset);
    }
  }

  return { summary, results };
}

// Run the smoke test
runSmokeTest().catch(err => {
  console.error('Smoke test error:', err);
  process.exit(1);
});
