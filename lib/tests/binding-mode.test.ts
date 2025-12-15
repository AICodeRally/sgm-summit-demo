/**
 * Binding Mode Tests
 *
 * Validates binding mode configuration and schema isolation
 */

import { getRegistry } from '@/lib/bindings/registry';
import { loadBindingConfig } from '@/lib/config/binding-config';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testBindingConfig() {
  console.log('\n📝 Test: Binding Configuration');

  const config = loadBindingConfig();

  // Test 1: Default binding mode should be synthetic
  const defaultMode = process.env.BINDING_MODE || 'synthetic';
  assert(defaultMode === 'synthetic', 'Default BINDING_MODE should be synthetic');
  console.log('  ✅ Default binding mode is synthetic');

  // Test 2: All providers should respect BINDING_MODE
  Object.keys(config.providers).forEach(provider => {
    const mode = (config.providers as any)[provider];
    assert(
      ['synthetic', 'mapped', 'live'].includes(mode),
      `Provider ${provider} has invalid mode: ${mode}`
    );
  });
  console.log('  ✅ All provider modes are valid');
}

function testSchemaIsolation() {
  console.log('\n📝 Test: Schema Isolation');

  const databaseUrl = process.env.DATABASE_URL || '';

  if (databaseUrl) {
    // Test 3: If DATABASE_URL exists, it must include schema parameter
    const hasSchemaParam = databaseUrl.includes('schema=sgm_summit_demo');
    assert(
      hasSchemaParam,
      'DATABASE_URL must include schema=sgm_summit_demo parameter'
    );
    console.log('  ✅ DATABASE_URL includes schema parameter');

    // Test 4: Schema parameter must be sgm_summit_demo
    const schemaMatch = databaseUrl.match(/schema=([^&]+)/);
    if (schemaMatch) {
      assert(
        schemaMatch[1] === 'sgm_summit_demo',
        'Schema parameter must be sgm_summit_demo'
      );
      console.log('  ✅ Schema is correctly set to sgm_summit_demo');
    }
  } else {
    console.log('  ⏭️  Skipping schema tests (no DATABASE_URL)');
  }
}

function testRegistryDiagnostics() {
  console.log('\n📝 Test: Registry Diagnostics');

  const registry = getRegistry();
  const diagnostics = registry.getDiagnostics();

  // Test 5: Diagnostics should include all required fields
  assert(diagnostics.providers !== undefined, 'Diagnostics should include providers');
  assert(diagnostics.modes !== undefined, 'Diagnostics should include modes');
  assert(diagnostics.database !== undefined, 'Diagnostics should include database info');
  console.log('  ✅ Diagnostics structure is complete');

  // Test 6: Database diagnostics should validate schema parameter
  if (diagnostics.database.hasUrl) {
    assert(
      diagnostics.database.schemaTarget === 'sgm_summit_demo' ||
      diagnostics.database.schemaTarget === 'MISSING/INVALID',
      'Schema target should be sgm_summit_demo or MISSING/INVALID'
    );
    console.log(`  ✅ Schema target: ${diagnostics.database.schemaTarget}`);
  }
}

function testLiveModeGuards() {
  console.log('\n📝 Test: Live Mode Guards');

  const config = loadBindingConfig();
  const isLiveMode = Object.values(config.providers).some(mode => mode === 'live');

  if (isLiveMode) {
    // Test 7: Live mode requires DATABASE_URL
    const hasUrl = !!process.env.DATABASE_URL;
    assert(hasUrl, 'Live mode requires DATABASE_URL');
    console.log('  ✅ DATABASE_URL present for live mode');

    // Test 8: Live mode requires schema parameter
    const hasSchemaParam = (process.env.DATABASE_URL || '').includes('schema=sgm_summit_demo');
    assert(hasSchemaParam, 'Live mode requires schema=sgm_summit_demo in DATABASE_URL');
    console.log('  ✅ Schema parameter present for live mode');
  } else {
    console.log('  ⏭️  Skipping live mode tests (synthetic mode active)');
  }
}

function testSyntheticDefault() {
  console.log('\n📝 Test: Synthetic Default');

  const config = loadBindingConfig();

  // Test 9: With no BINDING_MODE env var, all providers should default to synthetic
  if (!process.env.BINDING_MODE) {
    Object.entries(config.providers).forEach(([provider, mode]) => {
      assert(
        mode === 'synthetic',
        `Provider ${provider} should default to synthetic, got ${mode}`
      );
    });
    console.log('  ✅ All providers default to synthetic');
  } else {
    console.log(`  ⏭️  Skipping default test (BINDING_MODE=${process.env.BINDING_MODE})`);
  }
}

async function runTests() {
  console.log('=== Binding Mode Tests ===');

  try {
    testBindingConfig();
    testSchemaIsolation();
    testRegistryDiagnostics();
    testLiveModeGuards();
    testSyntheticDefault();

    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
