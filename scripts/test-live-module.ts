#!/usr/bin/env tsx

/**
 * Test Live Module Configuration
 *
 * This script fetches the module configuration from the running dev server
 * to verify what the actual app is using.
 */

async function testLiveModule() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Testing Live Module Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('📡 Fetching module configuration from API...\n');

    const response = await fetch('http://localhost:3003/api/settings/module');

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ ACTIVE MODULE (From Live Server)\n');
    console.log(`  Module ID:      ${data.activeModule.module.id}`);
    console.log(`  Product Line:   ${data.activeModule.module.productLine}`);
    console.log(`  Name:           ${data.activeModule.module.name}`);
    console.log(`  Tagline:        ${data.activeModule.module.tagline}`);
    console.log(`  Version:        ${data.activeModule.module.version}\n`);

    console.log('🎨 GRADIENT\n');
    console.log(`  ${data.activeModule.gradient.tailwindClass}\n`);
    console.log(`  Start:  ${data.activeModule.gradient.start}`);
    if (data.activeModule.gradient.mid1) {
      console.log(`  Mid 1:  ${data.activeModule.gradient.mid1}`);
    }
    if (data.activeModule.gradient.mid2) {
      console.log(`  Mid 2:  ${data.activeModule.gradient.mid2}`);
    }
    console.log(`  End:    ${data.activeModule.gradient.end}\n`);

    console.log('🔧 MODE COLORS\n');
    Object.entries(data.activeModule.modeColors).forEach(([mode, color]) => {
      console.log(`  ${mode.padEnd(10)} → ${color}`);
    });

    console.log('\n📦 AVAILABLE MODULES\n');
    data.availableModules.forEach((module: any) => {
      const isActive = module.id === data.activeModule.module.id;
      const marker = isActive ? '✓' : ' ';
      console.log(`  [${marker}] ${module.id.padEnd(20)} - ${module.productLine}`);
    });

    console.log(`\n📊 Total Modules: ${data.totalModules}\n`);

    // Verification
    if (data.activeModule.module.id === 'sparcc-finance') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUCCESS: Finance Module is Active!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('What you should see in the browser:\n');
      console.log('  1. Navbar tagline: "for Enterprise: Finance"');
      console.log('  2. SPARCC logo: Orange gradient');
      console.log('  3. SGM Circle: Orange gradient');
      console.log('  4. Homepage: Subtle orange background gradient');
      console.log('  5. Mode pages: Orange-themed (warm colors)\n');
      console.log('  Visit: http://localhost:3003\n');
    } else if (data.activeModule.module.id === 'sgm') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ℹ️  SGM Module is Active (Default)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('To switch to Finance module:\n');
      console.log('  1. Edit .env file:');
      console.log('     NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance\n');
      console.log('  2. Restart dev server:');
      console.log('     npm run dev\n');
    } else {
      console.log(`\n✅ Active Module: ${data.activeModule.module.id}\n`);
    }

  } catch (error) {
    console.error('❌ Error fetching module configuration:');
    console.error(`   ${error instanceof Error ? error.message : error}\n`);
    console.log('   Make sure the dev server is running on port 3003\n');
    process.exit(1);
  }
}

testLiveModule();
