#!/usr/bin/env node
/**
 * KB Coverage Check Script
 * Verifies that every page.tsx has a corresponding KB doc
 *
 * Usage: node scripts/check-kb-coverage.js [--json] [--fix]
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');
const KB_DIR = path.join(ROOT, 'knowledge', 'ui', 'pages');

const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const autoFix = args.includes('--fix');

function walk(dir, callback) {
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

function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function normalizeRoute(relPath) {
  // Split path and filter out route groups like (app), (home), (public)
  const parts = relPath.split(path.sep).filter(part => !isRouteGroup(part));
  if (parts.length === 0) return '/';
  return '/' + parts.join('/');
}

function getKbPath(route) {
  if (route === '/') {
    return path.join(KB_DIR, 'root.md');
  }
  return path.join(KB_DIR, route.slice(1), 'page.md');
}

function titleCase(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function titleFromRoute(route) {
  if (route === '/') return 'Home';
  const parts = route.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (last.startsWith('[') && last.endsWith(']')) {
    const param = last.slice(1, -1);
    return `${titleCase(param)} Detail`;
  }
  return titleCase(last);
}

function createKbTemplate(route) {
  const title = titleFromRoute(route);
  const date = new Date().toISOString().slice(0, 10);
  const description = route === '/'
    ? 'Entry point for the SGM platform.'
    : `Overview and usage notes for ${route}.`;

  return `---
route: ${route}
title: ${title}
description: ${description}
owner: TBD
lastUpdated: ${date}
---

# ${title}

## Purpose
Describe the goal of this page and the outcomes it supports.

## When to use
Explain when a user or agent should come here.

## How to use
1. List the primary steps to complete the workflow.
2. Note any required context, filters, or inputs.
3. Call out actions that update records or trigger automations.

## Key data
Highlight the key data, statuses, or metrics shown here.

## Data Types
If this page displays entities with data type classification:
- **Demo** (orange) - Sample data for demonstration purposes
- **Template** (teal) - Reusable templates for standardization
- **Client** (green) - Production client data

## Related
List related routes, APIs, or docs.
`;
}

// Collect all pages
const pages = [];
walk(APP_DIR, (filePath) => {
  if (path.basename(filePath) !== 'page.tsx') return;
  const relPath = path.relative(APP_DIR, path.dirname(filePath));
  const route = normalizeRoute(relPath);
  pages.push({ route, pagePath: filePath });
});

// Check KB coverage
const results = {
  total: pages.length,
  covered: 0,
  missing: [],
  timestamp: new Date().toISOString(),
};

for (const { route, pagePath } of pages) {
  const kbPath = getKbPath(route);
  const exists = fs.existsSync(kbPath);

  if (exists) {
    results.covered++;
  } else {
    results.missing.push({
      route,
      pagePath: path.relative(ROOT, pagePath),
      kbPath: path.relative(ROOT, kbPath),
    });

    if (autoFix) {
      // Create missing KB doc
      const dir = path.dirname(kbPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(kbPath, createKbTemplate(route), 'utf8');
    }
  }
}

results.coveragePercent = Math.round((results.covered / results.total) * 100);

if (outputJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log('\n=== KB Coverage Report ===\n');
  console.log(`Total Pages:    ${results.total}`);
  console.log(`KB Docs:        ${results.covered}`);
  console.log(`Missing:        ${results.missing.length}`);
  console.log(`Coverage:       ${results.coveragePercent}%`);

  if (results.missing.length > 0) {
    console.log('\n--- Missing KB Docs ---\n');
    for (const item of results.missing) {
      console.log(`  ${item.route}`);
      console.log(`    Page: ${item.pagePath}`);
      console.log(`    KB:   ${item.kbPath}`);
      if (autoFix) {
        console.log(`    --> CREATED`);
      }
      console.log('');
    }
  }

  if (!autoFix && results.missing.length > 0) {
    console.log('\nRun with --fix to auto-generate missing KB docs');
  }

  console.log('');
}

// Exit with error if missing and not fixing
if (results.missing.length > 0 && !autoFix) {
  process.exit(1);
}
