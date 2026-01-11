import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const STALE_DAYS = Number(process.env.KBCC_STALE_DAYS || '90');

interface SummaryCounts {
  routes: number;
  kbFiles: number;
  manifestEntries: number;
  missingKbFiles: number;
  missingInManifest: number;
  extraInManifest: number;
  staleEntries: number;
  missingOwners: number;
}

function walk(dir: string, callback: (filePath: string) => void) {
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

function parseFrontMatter(raw: string) {
  if (!raw.startsWith('---\n')) return { meta: {}, body: raw };
  const endIndex = raw.indexOf('\n---\n', 4);
  if (endIndex === -1) return { meta: {}, body: raw };
  const metaRaw = raw.slice(4, endIndex).trim();
  const body = raw.slice(endIndex + 5);
  const meta: Record<string, string> = {};
  for (const line of metaRaw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }
  return { meta, body };
}

function routeToKbPath(route: string) {
  if (route === '/') return 'root.md';
  return path.join(route.replace(/^\//, ''), 'page.md');
}

export function buildKbccReport() {
  const root = process.cwd();
  const appDir = path.join(root, 'app');
  const kbRoot = path.join(root, 'knowledge', 'ui', 'pages');
  const manifestPath = path.join(kbRoot, 'manifest.json');

  const routes = new Set<string>();
  walk(appDir, (filePath) => {
    if (path.basename(filePath) !== 'page.tsx') return;
    const relDir = path.relative(appDir, path.dirname(filePath));
    const route = relDir === '' ? '/' : '/' + relDir.split(path.sep).join('/');
    routes.add(route);
  });

  const missingKbFiles: Array<{ route: string; kbPath: string }> = [];
  for (const route of routes) {
    const relPath = routeToKbPath(route);
    const kbPath = path.join(kbRoot, relPath);
    if (!fs.existsSync(kbPath)) {
      missingKbFiles.push({ route, kbPath: path.relative(root, kbPath) });
    }
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifestRoutes = new Set(manifest.map((entry: { route: string }) => entry.route));
  const missingInManifest: string[] = [];
  const extraInManifest: string[] = [];

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

  const staleEntries: string[] = [];
  const missingOwners: string[] = [];
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

  const summary: SummaryCounts = {
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
  let repoName = process.env.KBCC_REPO_NAME || repoSlug;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    repoName = pkg.name || repoName;
  } catch {
    // ignore package.json parsing errors
  }

  return {
    repoSlug,
    repoName,
    repoPath: root,
    repoType: process.env.KBCC_REPO_TYPE || 'app',
    summary,
    details,
    collectedAt: new Date().toISOString(),
  };
}

export async function handleKbccReport(request: NextRequest) {
  const token = process.env.KBCC_INGEST_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Disabled' }, { status: 404 });
  }

  const provided = request.headers.get('x-kbcc-token');
  if (!provided || !safeEqual(provided, token)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const report = buildKbccReport();
  const target = process.env.KBCC_REPORT_URL;

  if (!target) {
    return NextResponse.json({ ok: true, data: report });
  }

  const response = await fetch(target, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-kbcc-token': token } : {}),
    },
    body: JSON.stringify(report),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    return NextResponse.json(
      { ok: false, error: data.error || 'KBCC report failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data: report });
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
