#!/usr/bin/env tsx

/**
 * Module Verification Script
 *
 * Verifies that the correct module is loaded and displays its configuration.
 */

import { getActiveModule, getAllModules } from '../lib/config/module-registry';
import { MODE_CONFIGS } from '../lib/auth/mode-permissions';
import { OperationalMode } from '../types/operational-mode';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎨 SPARCC Module Verification');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Get active module
const activeModule = getActiveModule();

console.log('✅ ACTIVE MODULE\n');
console.log(`  Module ID:      ${activeModule.module.id}`);
console.log(`  Product Line:   ${activeModule.module.productLine}`);
console.log(`  Name:           ${activeModule.module.name}`);
console.log(`  Tagline:        ${activeModule.module.tagline}`);
console.log(`  Version:        ${activeModule.module.version}\n`);

console.log('🎨 GRADIENT COLORS\n');
console.log(`  Start:  ${activeModule.gradient.start}`);
if (activeModule.gradient.mid1) console.log(`  Mid 1:  ${activeModule.gradient.mid1}`);
if (activeModule.gradient.mid2) console.log(`  Mid 2:  ${activeModule.gradient.mid2}`);
if (activeModule.gradient.mid3) console.log(`  Mid 3:  ${activeModule.gradient.mid3}`);
console.log(`  End:    ${activeModule.gradient.end}`);
console.log(`  Class:  ${activeModule.gradient.tailwindClass}\n`);

console.log('🔧 MODE COLORS (Auto-Distributed)\n');
Object.entries(activeModule.modeColors).forEach(([mode, color]) => {
  console.log(`  ${mode.padEnd(10)} → ${color}`);
});

console.log('\n📊 COMPARISON TABLE\n');
console.log('  Mode       | Color Code | Description');
console.log('  -----------|------------|---------------------------');
console.log(`  OVERSEE    | ${activeModule.modeColors.OVERSEE}  | Monitoring foundation`);
console.log(`  DISPUTE    | ${activeModule.modeColors.DISPUTE}  | Exception handling`);
console.log(`  OPERATE    | ${activeModule.modeColors.OPERATE}  | Day-to-day operations`);
console.log(`  DESIGN     | ${activeModule.modeColors.DESIGN}  | Strategic framework`);

console.log('\n📦 ALL AVAILABLE MODULES\n');
const allModules = getAllModules();
allModules.forEach((module) => {
  const isActive = module.module.id === activeModule.module.id;
  const marker = isActive ? '✓' : ' ';
  console.log(`  [${marker}] ${module.module.id.padEnd(20)} - ${module.module.productLine}`);
});

console.log('\n🔍 ENVIRONMENT VARIABLE\n');
console.log(`  NEXT_PUBLIC_SPARCC_MODULE = ${process.env.NEXT_PUBLIC_SPARCC_MODULE || '(not set, using default)'}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Visual color blocks (terminal colors)
console.log('🎨 VISUAL PREVIEW (Terminal Colors)\n');

const colorMap: Record<string, number> = {
  '#f97316': 208, // orange
  '#ea580c': 202, // dark orange
  '#c2410c': 166, // darker orange
  '#9a3412': 130, // darkest orange
  '#0ea5e9': 45,  // cyan
  '#3b82f6': 27,  // blue
  '#6366f1': 63,  // indigo
  '#8b5cf6': 99,  // violet
  '#eab308': 220, // yellow
  '#ca8a04': 178, // dark yellow
  '#a16207': 136, // darker yellow
  '#854d0e': 94,  // darkest yellow
};

Object.entries(activeModule.modeColors).forEach(([mode, color]) => {
  const ansiCode = colorMap[color as string] || 15;
  const block = `\x1b[48;5;${ansiCode}m    \x1b[0m`;
  console.log(`  ${block}  ${mode.padEnd(10)} ${color}`);
});

console.log('\n✅ Module verification complete!\n');

// Expected colors for Finance module
if (activeModule.module.id === 'sparcc-finance') {
  console.log('✅ FINANCE MODULE ACTIVE\n');
  console.log('  Expected colors:');
  console.log('    • Orange-500 (#f97316) for OVERSEE mode');
  console.log('    • Orange-600 (#ea580c) for DISPUTE mode');
  console.log('    • Orange-700 (#c2410c) for OPERATE mode');
  console.log('    • Orange-800 (#9a3412) for DESIGN mode');
  console.log('\n  UI Changes:');
  console.log('    • Navbar tagline: "for Enterprise: Finance"');
  console.log('    • Homepage background: Orange gradient');
  console.log('    • Mode pages: Orange-themed backgrounds');
  console.log('    • All metric cards: Orange borders and text\n');
} else if (activeModule.module.id === 'sgm') {
  console.log('ℹ️  SGM MODULE ACTIVE (Default)\n');
  console.log('  To test Finance module, set:\n');
  console.log('    NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance\n');
  console.log('  in your .env file and restart the dev server.\n');
}
