'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  Pencil2Icon,
  Cross2Icon,
  CheckIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface PageInfo {
  route: string;
  pagePath: string;
  kbPath: string;
  hasKb: boolean;
  kbLastUpdated?: string;
}

interface CoverageReport {
  total: number;
  covered: number;
  missing: number;
  coveragePercent: number;
  pages: PageInfo[];
  timestamp: string;
}

interface KbDoc {
  route: string;
  kbPath: string;
  content: string;
  meta: Record<string, string>;
  body: string;
}

export default function KBCoveragePage() {
  const [report, setReport] = useState<CoverageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'covered'>('all');

  // Editor state
  const [selectedPage, setSelectedPage] = useState<PageInfo | null>(null);
  const [kbDoc, setKbDoc] = useState<KbDoc | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCoverage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/kb-coverage');
      if (!response.ok) throw new Error('Failed to fetch coverage');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchKbDoc = async (page: PageInfo) => {
    setLoadingDoc(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`/api/admin/kb-coverage/${encodeURIComponent(page.route)}`);
      if (response.ok) {
        const data = await response.json();
        setKbDoc(data);
        setEditContent(data.content);
      } else if (response.status === 404) {
        // Create default template for missing KB
        const defaultContent = createDefaultTemplate(page.route);
        setKbDoc({
          route: page.route,
          kbPath: page.kbPath,
          content: defaultContent,
          meta: {},
          body: '',
        });
        setEditContent(defaultContent);
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: `Failed to load: ${err.message}` });
    } finally {
      setLoadingDoc(false);
    }
  };

  const saveKbDoc = async () => {
    if (!selectedPage) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`/api/admin/kb-coverage/${encodeURIComponent(selectedPage.route)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      if (!response.ok) throw new Error('Failed to save');
      setSaveMessage({ type: 'success', text: 'Saved successfully!' });
      // Refresh coverage to update status
      fetchCoverage();
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: `Failed to save: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const selectPage = (page: PageInfo) => {
    setSelectedPage(page);
    fetchKbDoc(page);
  };

  const closeEditor = () => {
    setSelectedPage(null);
    setKbDoc(null);
    setEditContent('');
    setSaveMessage(null);
  };

  useEffect(() => {
    fetchCoverage();
  }, []);

  const filteredPages = report?.pages.filter(page => {
    if (filter === 'missing') return !page.hasKb;
    if (filter === 'covered') return page.hasKb;
    return true;
  }) || [];

  const getCoverageColor = (percent: number) => {
    if (percent >= 100) return 'text-[color:var(--color-success)]';
    if (percent >= 80) return 'text-[color:var(--color-warning)]';
    return 'text-[color:var(--color-error)]';
  };

  return (
    <>
      <SetPageTitle
        title="KB Coverage"
        description="Monitor knowledge base documentation coverage"
      />
      <div className="h-screen flex flex-col sparcc-hero-bg">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                Knowledge Base Coverage
              </h2>
              <p className="text-sm text-[color:var(--color-muted)]">
                Ensure every page has documentation • Click to edit
              </p>
            </div>
            <button
              onClick={fetchCoverage}
              disabled={loading}
              className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ReloadIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {report && (
          <div className="px-8 py-4 bg-[color:var(--color-surface)]">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">Total Pages</p>
                <p className="text-3xl font-bold text-[color:var(--color-foreground)]">{report.total}</p>
              </div>
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">With KB Docs</p>
                <p className="text-3xl font-bold text-[color:var(--color-success)]">{report.covered}</p>
              </div>
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">Missing Docs</p>
                <p className={`text-3xl font-bold ${report.missing > 0 ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-success)]'}`}>
                  {report.missing}
                </p>
              </div>
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">Coverage</p>
                <p className={`text-3xl font-bold ${getCoverageColor(report.coveragePercent)}`}>
                  {report.coveragePercent}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-8 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
          <div className="flex gap-2">
            {(['all', 'missing', 'covered'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-[color:var(--color-primary)] text-white'
                    : 'bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                {f === 'all' ? 'All Pages' : f === 'missing' ? 'Missing KB' : 'Has KB'}
                {report && (
                  <span className="ml-2 opacity-75">
                    ({f === 'all' ? report.total : f === 'missing' ? report.missing : report.covered})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - List + Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Page List */}
          <div className={`${selectedPage ? 'w-1/2' : 'w-full'} overflow-y-auto px-8 py-6 transition-all`}>
            {loading && !report ? (
              <div className="flex flex-col items-center justify-center h-64">
                <ReloadIcon className="h-8 w-8 animate-spin text-[color:var(--color-muted)]" />
                <p className="mt-4 text-[color:var(--color-muted)]">Loading coverage report...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <ExclamationTriangleIcon className="h-12 w-12 text-[color:var(--color-error)]" />
                <p className="mt-4 text-[color:var(--color-error)]">{error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPages.map((page) => (
                  <button
                    key={page.route}
                    onClick={() => selectPage(page)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                      selectedPage?.route === page.route
                        ? 'bg-[color:var(--color-primary-bg)] border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]'
                        : page.hasKb
                          ? 'bg-[color:var(--color-surface)] border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]'
                          : 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)] hover:border-[color:var(--color-error)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {page.hasKb ? (
                        <CheckCircledIcon className="h-5 w-5 text-[color:var(--color-success)]" />
                      ) : (
                        <CrossCircledIcon className="h-5 w-5 text-[color:var(--color-error)]" />
                      )}
                      <div>
                        <span className="font-medium text-[color:var(--color-foreground)]">
                          {page.route}
                        </span>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          {page.kbPath}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {page.hasKb && page.kbLastUpdated && (
                        <span className="text-xs text-[color:var(--color-muted)]">
                          {page.kbLastUpdated}
                        </span>
                      )}
                      {page.hasKb ? (
                        <Pencil2Icon className="h-4 w-4 text-[color:var(--color-muted)]" />
                      ) : (
                        <PlusIcon className="h-4 w-4 text-[color:var(--color-error)]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editor Panel */}
          {selectedPage && (
            <div className="w-1/2 border-l border-[color:var(--color-border)] bg-[color:var(--color-surface)] flex flex-col">
              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-border)]">
                <div>
                  <h3 className="font-semibold text-[color:var(--color-foreground)]">
                    {selectedPage.hasKb ? 'Edit' : 'Create'} KB Doc
                  </h3>
                  <p className="text-xs text-[color:var(--color-muted)]">{selectedPage.route}</p>
                </div>
                <div className="flex items-center gap-2">
                  {saveMessage && (
                    <span className={`text-sm ${saveMessage.type === 'success' ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'}`}>
                      {saveMessage.text}
                    </span>
                  )}
                  <button
                    onClick={saveKbDoc}
                    disabled={saving || loadingDoc}
                    className="px-4 py-2 bg-[color:var(--color-success)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={closeEditor}
                    className="p-2 rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 p-6 overflow-hidden">
                {loadingDoc ? (
                  <div className="flex items-center justify-center h-full">
                    <ReloadIcon className="h-6 w-6 animate-spin text-[color:var(--color-muted)]" />
                  </div>
                ) : (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                    placeholder="Enter KB documentation in Markdown format..."
                  />
                )}
              </div>

              {/* Editor Footer */}
              <div className="px-6 py-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
                <p className="text-xs text-[color:var(--color-muted)]">
                  File: {selectedPage.kbPath} • Use Markdown with YAML frontmatter
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {report && !selectedPage && (
          <div className="px-8 py-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
            <p className="text-xs text-[color:var(--color-muted)]">
              Last checked: {new Date(report.timestamp).toLocaleString()} •
              Click any row to edit • Or run <code className="bg-[color:var(--color-surface)] px-1 rounded">node scripts/check-kb-coverage.js --fix</code>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function createDefaultTemplate(route: string): string {
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

function titleFromRoute(route: string): string {
  if (route === '/') return 'Home';
  const parts = route.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (last.startsWith('[') && last.endsWith(']')) {
    const param = last.slice(1, -1);
    return titleCase(param) + ' Detail';
  }
  return titleCase(last);
}

function titleCase(value: string): string {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
