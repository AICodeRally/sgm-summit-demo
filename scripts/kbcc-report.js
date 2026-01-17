const fs = require('fs');
const path = require('path');
require('dotenv').config();

const root = process.cwd();
const appDir = path.join(root, 'app');
const kbRoot = path.join(root, 'knowledge', 'ui', 'pages');
const manifestPath = path.join(kbRoot, 'manifest.json');

const STALE_DAYS = Number(process.env.KBCC_STALE_DAYS || '90');
const KBCC_REPORT_URL = process.env.KBCC_REPORT_URL;
const KBCC_TOKEN = process.env.KBCC_INGEST_TOKEN;

if (!KBCC_REPORT_URL) {
  console.error('KBCC_REPORT_URL is required.');
  process.exit(1);
}

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

function parseFrontMatter(raw) {
  if (!raw.startsWith('---\n')) return { meta: {}, body: raw };
  const endIndex = raw.indexOf('\n---\n', 4);
  if (endIndex === -1) return { meta: {}, body: raw };
  const metaRaw = raw.slice(4, endIndex).trim();
  const body = raw.slice(endIndex + 5);
  const meta = {};
  for (const line of metaRaw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }
  return { meta, body };
}

function titleFromRoute(route) {
  if (route === '/') return 'root.md';
  return path.join(route.replace(/^\//, ''), 'page.md');
}

const routes = new Set();
walk(appDir, (filePath) => {
  if (path.basename(filePath) !== 'page.tsx') return;
  const relDir = path.relative(appDir, path.dirname(filePath));
  const route = relDir === '' ? '/' : '/' + relDir.split(path.sep).join('/');
  routes.add(route);
});

const missingKbFiles = [];
for (const route of routes) {
  const relPath = titleFromRoute(route);
  const kbPath = path.join(kbRoot, relPath);
  if (!fs.existsSync(kbPath)) {
    missingKbFiles.push({ route, kbPath: path.relative(root, kbPath) });
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

const staleEntries = [];
const missingOwners = [];
const now = Date.now();

for (const entry of manifest) {
  const filePath = path.join(root, entry.file);
  if (!fs.existsSync(filePath)) continue;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { meta } = parseFrontMatter(raw);
  const lastUpdated = meta.lastUpdated ? Date.parse(meta.lastUpdated) : NaN;
  if (!Number.isFinite(lastUpdated) || (now - lastUpdated) > STALE_DAYS * 24 * 60 * 60 * 1000) {
    staleEntries.push(entry.file);
  }
  const owner = (meta.owner || '').toLowerCase();
  if (!owner || owner === 'tbd') {
    missingOwners.push(entry.file);
  }
}

const summary = {
  routes: routes.size,
  kbFiles: manifest.length,
  manifestEntries: manifest.length,
  missingKbFiles: missingKbFiles.length,
  missingInManifest: missingInManifest.length,
  extraInManifest: extraInManifest.length,
  staleEntries: staleEntries.length,
  missingOwners: missingOwners.length,
};

const details = {
  missingKbFiles,
  missingInManifest,
  extraInManifest,
  staleEntries,
  missingOwners,
};

const repoSlug = process.env.KBCC_REPO_SLUG || path.basename(root);
let repoName = process.env.KBCC_REPO_NAME;
if (!repoName) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    repoName = pkg.name || repoSlug;
  } catch {
    repoName = repoSlug;
  }
}

const payload = {
  repoSlug,
  repoName,
  repoPath: root,
  repoType: process.env.KBCC_REPO_TYPE || 'app',
  summary,
  details,
  collectedAt: new Date().toISOString(),
};

async function sendReport() {
  const response = await fetch(KBCC_REPORT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(KBCC_TOKEN ? { 'x-kbcc-token': KBCC_TOKEN } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    console.error('KBCC report failed:', data.error || response.statusText);
    process.exit(1);
  }

  console.log('KBCC report sent:', {
    repoSlug: payload.repoSlug,
    status: data.data?.status,
    collectedAt: data.data?.collectedAt,
  });
}

sendReport().catch((err) => {
  console.error('KBCC report error:', err);
  process.exit(1);
});
