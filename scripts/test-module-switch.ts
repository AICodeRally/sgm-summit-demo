/**
 * Test Module Switching
 *
 * This script tests switching between SPARCC modules and shows
 * what colors will be applied to each mode.
 */

import {
  getActiveModule,
  setActiveModule,
  getAllModules,
  type ModuleConfig,
} from '../lib/config/module-registry';
import { distributeGradientToModes } from '../lib/config/color-distribution';

function displayModuleInfo(module: ModuleConfig) {
  console.log('\n' + '='.repeat(70));
  console.log(`MODULE: ${module.module.productLine} - ${module.module.name}`);
  console.log('='.repeat(70));
  console.log(`ID:       ${module.module.id}`);
  console.log(`Tagline:  ${module.module.tagline}`);
  console.log(`Version:  ${module.module.version}`);
  console.log('\nGRADIENT:');
  console.log(`  Start:  ${module.gradient.start}`);
  if (module.gradient.mid1) console.log(`  Mid 1:  ${module.gradient.mid1}`);
  if (module.gradient.mid2) console.log(`  Mid 2:  ${module.gradient.mid2}`);
  if (module.gradient.mid3) console.log(`  Mid 3:  ${module.gradient.mid3}`);
  console.log(`  End:    ${module.gradient.end}`);
  console.log(`\n  Tailwind: ${module.gradient.tailwindClass}`);

  console.log('\nMODE COLORS (Auto-Distributed):');
  console.log(`  OVERSEE (0.0):  ${module.modeColors.OVERSEE}`);
  console.log(`  DISPUTE (0.33): ${module.modeColors.DISPUTE}`);
  console.log(`  OPERATE (0.67): ${module.modeColors.OPERATE}`);
  console.log(`  DESIGN (1.0):   ${module.modeColors.DESIGN}`);

  console.log('\nDATA CONTRACT:');
  console.log(`  Entities:      ${module.data.entities.join(', ')}`);
  console.log(`  API Version:   ${module.data.apiVersion}`);
  console.log(`  DB Schema:     ${module.data.databaseSchema}`);

  console.log('\nAI CAPABILITIES:');
  console.log(`  Agents:        ${module.ai.agents?.join(', ') || 'None'}`);
  console.log(`  Features:      ${module.ai.features?.join(', ') || 'None'}`);
  console.log('='.repeat(70) + '\n');
}

function testModuleSwitch() {
  console.log('\n🧪 SPARCC MODULE SWITCHING TEST\n');

  // Show current module
  console.log('📍 CURRENT MODULE (BEFORE SWITCH):');
  const currentModule = getActiveModule();
  displayModuleInfo(currentModule);

  // Show all available modules
  const allModules = getAllModules();
  console.log(`\n📦 AVAILABLE MODULES: ${allModules.length} total\n`);
  allModules.forEach((m, i) => {
    console.log(`${i + 1}. ${m.module.id} - ${m.module.name} (${m.module.productLine})`);
  });

  // Switch to SPARCC Enterprise Finance
  console.log('\n\n🔄 SWITCHING TO: sparcc-finance (SPARCC Enterprise Finance)\n');
  const success = setActiveModule('sparcc-finance');

  if (success) {
    console.log('✅ Module switch successful!\n');

    // Show new active module
    console.log('📍 NEW ACTIVE MODULE (AFTER SWITCH):');
    const newModule = getActiveModule();
    displayModuleInfo(newModule);

    // Show what will change in the UI
    console.log('🎨 UI CHANGES THAT WILL OCCUR:\n');
    console.log('  Navbar:');
    console.log(`    - Tagline: "Platform" → "${newModule.module.tagline}"`);
    console.log(`    - Gradient: Cyan→Violet → Orange→Burnt Orange`);
    console.log('');
    console.log('  Homepage:');
    console.log(`    - Background: Subtle orange gradient`);
    console.log(`    - Title: Orange gradient (${newModule.gradient.start} → ${newModule.gradient.end})`);
    console.log('');
    console.log('  Mode Landing Pages:');
    console.log(`    - Design:  ${newModule.modeColors.DESIGN} (burnt orange - strategic)`);
    console.log(`    - Operate: ${newModule.modeColors.OPERATE} (orange-700 - operations)`);
    console.log(`    - Dispute: ${newModule.modeColors.DISPUTE} (orange-600 - exceptions)`);
    console.log(`    - Oversee: ${newModule.modeColors.OVERSEE} (orange-500 - monitoring)`);
    console.log('');
    console.log('  Quick Access Cards:');
    console.log('    - Hover colors: Mode-specific oranges');
    console.log('');

    // Switch back to SGM for demonstration
    console.log('\n🔄 SWITCHING BACK TO: sgm (Sales Governance Management)\n');
    setActiveModule('sgm');
    console.log('✅ Restored to SGM module\n');

    const restoredModule = getActiveModule();
    console.log('📍 RESTORED MODULE:');
    displayModuleInfo(restoredModule);

  } else {
    console.log('❌ Module switch failed!\n');
  }
}

// Run the test
testModuleSwitch();

console.log('\n💡 TO APPLY IN BROWSER:');
console.log('   1. Navigate to /settings/module (SUPER_ADMIN only)');
console.log('   2. OR: Click Module Switcher in navbar');
console.log('   3. Select "SPARCC for Enterprise: Finance"');
console.log('   4. Page will reload with orange color scheme\n');
