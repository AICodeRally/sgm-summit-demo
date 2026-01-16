import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * KB Coverage API
 * Returns coverage report for KB documentation
 */

const APP_DIR = path.join(process.cwd(), 'app');
const KB_DIR = path.join(process.cwd(), 'knowledge', 'ui', 'pages');

function walk(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
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

function isRouteGroup(segment: string): boolean {
  return segment.startsWith('(') && segment.endsWith(')');
}

function normalizeRoute(relPath: string): string {
  const parts = relPath.split(path.sep).filter(part => !isRouteGroup(part));
  if (parts.length === 0) return '/';
  return '/' + parts.join('/');
}

function getKbPath(route: string): string {
  if (route === '/') {
    return path.join(KB_DIR, 'root.md');
  }
  return path.join(KB_DIR, route.slice(1), 'page.md');
}

interface PageInfo {
  route: string;
  pagePath: string;
  kbPath: string;
  hasKb: boolean;
  kbLastUpdated?: string;
}

export async function GET() {
  try {
    const pages: PageInfo[] = [];

    walk(APP_DIR, (filePath) => {
      if (path.basename(filePath) !== 'page.tsx') return;
      const relPath = path.relative(APP_DIR, path.dirname(filePath));
      const route = normalizeRoute(relPath);
      const kbPath = getKbPath(route);
      const hasKb = fs.existsSync(kbPath);

      let kbLastUpdated: string | undefined;
      if (hasKb) {
        try {
          const content = fs.readFileSync(kbPath, 'utf8');
          const match = content.match(/lastUpdated:\s*(\d{4}-\d{2}-\d{2})/);
          if (match) {
            kbLastUpdated = match[1];
          }
        } catch {
          // Ignore read errors
        }
      }

      pages.push({
        route,
        pagePath: path.relative(process.cwd(), filePath),
        kbPath: path.relative(process.cwd(), kbPath),
        hasKb,
        kbLastUpdated,
      });
    });

    // Sort by route
    pages.sort((a, b) => a.route.localeCompare(b.route));

    const covered = pages.filter(p => p.hasKb).length;
    const missing = pages.filter(p => !p.hasKb);

    return NextResponse.json({
      total: pages.length,
      covered,
      missing: missing.length,
      coveragePercent: Math.round((covered / pages.length) * 100),
      pages,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
