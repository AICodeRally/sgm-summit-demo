const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appDir = path.join(root, 'app');
const kbRoot = path.join(root, 'knowledge', 'ui', 'pages');
const manifestPath = path.join(kbRoot, 'manifest.json');

function walk(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else if (entry.isFile()) {
      callback(fullPath);
    }
  }
}

const routes = new Set();
walk(appDir, (filePath) => {
  if (path.basename(filePath) !== 'page.tsx') return;
  const relDir = path.relative(appDir, path.dirname(filePath));
  const route = relDir === '' ? '/' : '/' + relDir.split(path.sep).join('/');
  routes.add(route);
});

const missingKb = [];
for (const route of routes) {
  const relPath = route === '/' ? 'root.md' : path.join(route.replace(/^\//, ''), 'page.md');
  const kbPath = path.join(kbRoot, relPath);
  if (!fs.existsSync(kbPath)) {
    missingKb.push({ route, kbPath: path.relative(root, kbPath) });
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestRoutes = new Set(manifest.map((entry) => entry.route));
const missingInManifest = [];
const extraInManifest = [];

for (const route of routes) {
  if (!manifestRoutes.has(route)) missingInManifest.push(route);
}

for (const entry of manifest) {
  if (!routes.has(entry.route)) extraInManifest.push(entry.route);
  const filePath = path.join(root, entry.file);
  if (!fs.existsSync(filePath)) {
    extraInManifest.push(`${entry.route} (missing file)`);
  }
}

let hasErrors = false;

console.log(`Routes: ${routes.size}`);

if (missingKb.length) {
  hasErrors = true;
  console.log(`Missing KB files: ${missingKb.length}`);
  missingKb.forEach((m) => console.log(`${m.route} -> ${m.kbPath}`));
} else {
  console.log('Missing KB files: 0');
}

if (missingInManifest.length) {
  hasErrors = true;
  console.log(`Missing in manifest: ${missingInManifest.length}`);
  missingInManifest.forEach((r) => console.log(r));
} else {
  console.log('Missing in manifest: 0');
}

if (extraInManifest.length) {
  hasErrors = true;
  console.log(`Extra in manifest: ${extraInManifest.length}`);
  extraInManifest.forEach((r) => console.log(r));
} else {
  console.log('Extra in manifest: 0');
}

if (hasErrors) {
  process.exitCode = 1;
}
