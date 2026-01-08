#!/usr/bin/env node

/**
 * Build Portable Distribution
 *
 * Creates a portable ZIP package with:
 * - Standalone executable (using pkg)
 * - Data directories
 * - Start scripts for all platforms
 * - README instructions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const VERSION = require('../package.json').version;
const OUTPUT_DIR = path.join(__dirname, '..', 'dist-portable');
const PACKAGE_NAME = `sgm-portable-v${VERSION}`;

console.log('Building Portable Distribution...');
console.log('='.repeat(50));

// Clean output directory
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Create package directory
const packageDir = path.join(OUTPUT_DIR, PACKAGE_NAME);
fs.mkdirSync(packageDir, { recursive: true });

// Step 1: Build Next.js application
console.log('\n1. Building Next.js application...');
execSync('npm run build', { stdio: 'inherit' });

// Step 2: Copy Next.js standalone output
console.log('\n2. Copying Next.js standalone output...');
const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
if (!fs.existsSync(standalonePath)) {
  console.error('Error: .next/standalone not found. Make sure Next.js build completed.');
  process.exit(1);
}

// Copy standalone to package directory
console.log('Copying standalone output...');
// Copy regular files and directories
execSync(`cp -r ${standalonePath}/* ${packageDir}/`, { stdio: 'inherit' });
// Copy .next directory (dot files not included in *)
execSync(`cp -r ${standalonePath}/.next ${packageDir}/`, { stdio: 'inherit' });
// Copy .env if exists
const envFile = path.join(standalonePath, '.env');
if (fs.existsSync(envFile)) {
  execSync(`cp ${envFile} ${packageDir}/`, { stdio: 'inherit' });
}

// Copy .next/static directory (standalone doesn't include static assets)
console.log('Copying static assets...');
const staticSrc = path.join(__dirname, '..', '.next', 'static');
const staticDest = path.join(packageDir, '.next');
execSync(`cp -r "${staticSrc}" "${staticDest}/"`, { stdio: 'inherit' });

// Copy public directory
execSync(`cp -r ${path.join(__dirname, '..', 'public')} ${packageDir}/`, { stdio: 'inherit' });

// Copy prisma schema and generated client
execSync(`cp -r ${path.join(__dirname, '..', 'prisma')} ${packageDir}/`, { stdio: 'inherit' });
execSync(`cp -r ${path.join(__dirname, '..', 'node_modules', '.prisma')} ${packageDir}/node_modules/`, { stdio: 'inherit' });

// Step 3: Create data directories
console.log('\n3. Creating data directories...');
fs.mkdirSync(path.join(packageDir, 'data', 'documents'), { recursive: true });
fs.mkdirSync(path.join(packageDir, 'data', 'plans'), { recursive: true });

// Step 4: Create start scripts
console.log('\n4. Creating start scripts...');

// Windows start script
const windowsStart = `@echo off
echo Starting SGM...
echo.

REM Set environment variables
set DATABASE_URL=file:./data/sgm.db
set DOCUMENT_ROOT=./data/documents
set PLAN_ROOT=./data/plans
set STORAGE_MODE=local_sqlite
set ENABLE_DEMO_DATA=false
set PORT=3003

REM Start the server
echo Server starting at http://localhost:3003
echo Press Ctrl+C to stop
node server.js

pause
`;

fs.writeFileSync(path.join(packageDir, 'START_SGM.bat'), windowsStart);

// Mac/Linux start script
const unixStart = `#!/bin/bash

echo "Starting SGM..."
echo ""

# Set environment variables
export DATABASE_URL=file:./data/sgm.db
export DOCUMENT_ROOT=./data/documents
export PLAN_ROOT=./data/plans
export STORAGE_MODE=local_sqlite
export ENABLE_DEMO_DATA=false
export PORT=3003

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed."
  echo "Please install Node.js 20+ from https://nodejs.org"
  exit 1
fi

# Start the server
echo "Server starting at http://localhost:3003"
echo "Press Ctrl+C to stop"
echo ""
node server.js
`;

fs.writeFileSync(path.join(packageDir, 'start.sh'), unixStart);
fs.chmodSync(path.join(packageDir, 'start.sh'), '755');

// Step 5: Create README
console.log('\n5. Creating README...');

const readme = `# SGM Portable - Version ${VERSION}

## Privacy-First Sales Governance Management

This is a portable, standalone version of SGM that runs entirely on your local machine.
No cloud services, no external dependencies - your data stays with you.

## Quick Start

### Windows
1. Double-click \`START_SGM.bat\`
2. Your browser will open to http://localhost:3003
3. Start managing your compensation plans!

### macOS / Linux
1. Open Terminal in this directory
2. Run: \`./start.sh\`
3. Your browser will open to http://localhost:3003

## Data Location

All your data is stored in the \`data/\` folder:
- **data/sgm.db** - SQLite database with all your metadata
- **data/documents/** - Your document files
- **data/plans/** - Your plan files

**Backup:** Simply copy the entire \`data/\` folder to backup your data.

## System Requirements

- **Node.js:** Version 20 or higher (download from https://nodejs.org)
- **Operating System:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 2GB minimum, 4GB recommended
- **Disk Space:** 500MB for application + space for your documents
- **Port:** 3003 must be available (or change PORT in start script)

## Features

- ✅ **100% Local** - All data stays on your machine
- ✅ **No Installation** - Just unzip and run
- ✅ **Portable** - Run from USB drive or any folder
- ✅ **Privacy-First** - No analytics, no telemetry, no cloud
- ✅ **Offline** - Works without internet connection

## Troubleshooting

### "Port 3003 already in use"
Edit the start script and change \`PORT=3003\` to another number (e.g., 3004)

### "Permission denied" (Mac/Linux)
Run: \`chmod +x start.sh\` then try again

### Database locked
Make sure only one instance of SGM is running

### Browser doesn't open automatically
Manually open: http://localhost:3003

## Security

- All data is stored locally in SQLite database
- No internet connection required
- No data sent to external services
- You control all backups and data retention

## Support

- Documentation: https://docs.sgm.com
- Issues: https://github.com/bhg/sgm/issues
- Email: support@sgm.com

## License

© 2026 BHG Analytics. All rights reserved.

---

**SGM Portable v${VERSION}**
Built: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(packageDir, 'README.txt'), readme);

// Step 6: Create ZIP archive
console.log('\n6. Creating ZIP archive...');

const output = fs.createWriteStream(path.join(OUTPUT_DIR, `${PACKAGE_NAME}.zip`));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const size = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Portable distribution created successfully!`);
  console.log(`📦 File: ${PACKAGE_NAME}.zip`);
  console.log(`📊 Size: ${size} MB`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(50)}\n`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(packageDir, PACKAGE_NAME);
archive.finalize();
