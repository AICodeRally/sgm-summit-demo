import fs from 'fs/promises';
import path from 'path';

export interface PageKbMeta {
  route?: string;
  title?: string;
  description?: string;
  owner?: string;
  lastUpdated?: string;
}

export interface PageKbData {
  route: string;
  file: string;
  meta: PageKbMeta;
  content: string;
}

interface ManifestEntry {
  route: string;
  file: string;
}

const KB_ROOT = path.join(process.cwd(), 'knowledge', 'ui', 'pages');
const MANIFEST_PATH = path.join(KB_ROOT, 'manifest.json');

let manifestCache: ManifestEntry[] | null = null;

async function loadManifest(): Promise<ManifestEntry[]> {
  if (manifestCache) return manifestCache;
  const raw = await fs.readFile(MANIFEST_PATH, 'utf-8');
  const data = JSON.parse(raw) as ManifestEntry[];
  manifestCache = data;
  return data;
}

function normalizePathname(pathname: string): string {
  const clean = pathname.split('?')[0].split('#')[0];
  if (!clean || clean === '') return '/';
  if (clean === '/') return '/';
  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}

function isParamSegment(segment: string): boolean {
  return segment.startsWith('[') && segment.endsWith(']');
}

function matchesRoutePattern(pattern: string, pathname: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (isParamSegment(patternPart)) continue;
    if (patternPart !== pathPart) return false;
  }
  return true;
}

function scorePattern(pattern: string): number {
  const parts = pattern.split('/').filter(Boolean);
  const staticCount = parts.filter((part) => !isParamSegment(part)).length;
  return staticCount * 10 + (parts.length === 0 ? 1 : 0);
}

function parseFrontMatter(content: string): { meta: PageKbMeta; body: string } {
  if (!content.startsWith('---\n')) {
    return { meta: {}, body: content };
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { meta: {}, body: content };
  }

  const rawMeta = content.slice(4, endIndex).trim();
  const body = content.slice(endIndex + 5);
  const meta: PageKbMeta = {};

  rawMeta.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) return;
    (meta as Record<string, string>)[key] = value;
  });

  return { meta, body };
}

export async function loadPageKbByPath(pathname: string): Promise<PageKbData | null> {
  const normalized = normalizePathname(pathname);
  const manifest = await loadManifest();

  let bestMatch: ManifestEntry | null = null;
  let bestScore = -1;

  for (const entry of manifest) {
    if (!matchesRoutePattern(entry.route, normalized)) continue;
    const score = scorePattern(entry.route);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (!bestMatch) return null;

  const filePath = path.join(process.cwd(), bestMatch.file);
  const raw = await fs.readFile(filePath, 'utf-8');
  const { meta, body } = parseFrontMatter(raw);

  return {
    route: bestMatch.route,
    file: bestMatch.file,
    meta,
    content: body.trim(),
  };
}
