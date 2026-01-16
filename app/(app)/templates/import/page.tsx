'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadIcon,
  FileTextIcon,
  Cross2Icon,
  CheckCircledIcon,
  CrossCircledIcon,
  ArrowLeftIcon,
  DownloadIcon,
  TableIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'complete' | 'error';

interface ParsedTemplate {
  code: string;
  name: string;
  description: string;
  planType: string;
  category: string;
  tags: string[];
  version: string;
  status: string;
  isValid: boolean;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  code: string;
  name: string;
  error?: string;
}

const VALID_PLAN_TYPES = ['COMPENSATION_PLAN', 'GOVERNANCE_PLAN', 'POLICY_CREATION_PLAN'];
const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED'];

export default function TemplateImportPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateTemplate = (row: Record<string, string>, index: number): ParsedTemplate => {
    const errors: string[] = [];

    const code = row['code'] || row['template_code'] || '';
    const name = row['name'] || row['template_name'] || '';
    const description = row['description'] || row['template_description'] || '';
    const planType = row['plan_type'] || row['planType'] || 'COMPENSATION_PLAN';
    const category = row['category'] || '';
    const tagsRaw = row['tags'] || '';
    const version = row['version'] || '1.0.0';
    const statusVal = row['status'] || 'DRAFT';

    // Validate required fields
    if (!code) {
      errors.push('Code is required');
    } else if (!/^TPL-[A-Z]+-\d{3}$/.test(code)) {
      errors.push(`Invalid code format. Expected: TPL-XXX-000 (got: ${code})`);
    }

    if (!name) {
      errors.push('Name is required');
    } else if (name.length > 200) {
      errors.push('Name must be 200 characters or less');
    }

    if (description && description.length > 2000) {
      errors.push('Description must be 2000 characters or less');
    }

    if (!VALID_PLAN_TYPES.includes(planType)) {
      errors.push(`Invalid plan type. Must be one of: ${VALID_PLAN_TYPES.join(', ')}`);
    }

    if (!VALID_STATUSES.includes(statusVal)) {
      errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
      errors.push('Invalid version format. Expected: X.Y.Z (e.g., 1.0.0)');
    }

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    return {
      code,
      name,
      description,
      planType,
      category,
      tags,
      version,
      status: statusVal,
      isValid: errors.length === 0,
      errors,
    };
  };

  const parseCSV = (content: string): Record<string, string>[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0 || values.every(v => !v)) continue; // Skip empty rows

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  // Simple CSV line parser that handles quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result.map(v => v.replace(/^["']|["']$/g, ''));
  };

  const handleFile = useCallback(async (file: File) => {
    setStatus('parsing');
    setError(null);

    try {
      const content = await file.text();
      const rows = parseCSV(content);

      if (rows.length === 0) {
        throw new Error('No data rows found in CSV');
      }

      const templates = rows.map((row, index) => validateTemplate(row, index));
      setParsedTemplates(templates);
      setStatus('preview');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      handleFile(file);
    } else {
      setError('Please upload a CSV file');
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleImport = async () => {
    const validTemplates = parsedTemplates.filter(t => t.isValid);
    if (validTemplates.length === 0) {
      setError('No valid templates to import');
      return;
    }

    setStatus('importing');
    const results: ImportResult[] = [];

    for (const template of validTemplates) {
      try {
        const response = await fetch('/api/plan-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: template.code,
            name: template.name,
            description: template.description,
            planType: template.planType,
            category: template.category || undefined,
            tags: template.tags.length > 0 ? template.tags : undefined,
            version: template.version,
            status: template.status,
            source: 'USER_CREATED',
            isSystemTemplate: false,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          results.push({
            success: false,
            code: template.code,
            name: template.name,
            error: data.error || `HTTP ${response.status}`,
          });
        } else {
          results.push({
            success: true,
            code: template.code,
            name: template.name,
          });
        }
      } catch (err: any) {
        results.push({
          success: false,
          code: template.code,
          name: template.name,
          error: err.message,
        });
      }
    }

    setImportResults(results);
    setStatus('complete');
  };

  const downloadSampleCSV = () => {
    const sample = `code,name,description,plan_type,category,tags,version,status
TPL-COMP-100,Q1 Sales Plan,Quarterly sales compensation plan template,COMPENSATION_PLAN,Sales,quarterly;sales;compensation,1.0.0,DRAFT
TPL-GOV-100,Compliance Review,Governance compliance review template,GOVERNANCE_PLAN,Compliance,governance;review,1.0.0,DRAFT
TPL-POL-100,Policy Update,Policy creation and update template,POLICY_CREATION_PLAN,Policy,policy;update,1.0.0,DRAFT`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedTemplates.filter(t => t.isValid).length;
  const invalidCount = parsedTemplates.filter(t => !t.isValid).length;
  const successCount = importResults.filter(r => r.success).length;
  const failCount = importResults.filter(r => !r.success).length;

  return (
    <>
      <SetPageTitle title="Import Templates" description="Bulk import templates from CSV" />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/templates"
              className="p-2 rounded-lg bg-[color:var(--color-surface)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)] transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">Import Templates</h1>
              <p className="text-[color:var(--color-muted)] mt-1">Upload a CSV file to bulk import plan templates</p>
            </div>
          </div>

          {/* Status: Idle - Upload Area */}
          {status === 'idle' && (
            <div className="space-y-6">
              {/* Upload Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-[color:var(--color-primary)] bg-[color:var(--color-info-bg)]'
                    : 'border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadIcon className="h-12 w-12 text-[color:var(--color-muted)] mx-auto mb-4" />
                <p className="text-lg font-medium text-[color:var(--color-foreground)] mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-[color:var(--color-muted)] mb-4">
                  or click to browse files
                </p>
                <span className="inline-block px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg">
                  Select File
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <InfoCircledIcon className="h-5 w-5 text-[color:var(--color-primary)] mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[color:var(--color-foreground)]">CSV Format Requirements</h3>
                    <p className="text-sm text-[color:var(--color-muted)] mt-1">
                      Your CSV file should include these columns
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <th className="text-left py-2 pr-4 text-[color:var(--color-foreground)]">Column</th>
                        <th className="text-left py-2 pr-4 text-[color:var(--color-foreground)]">Required</th>
                        <th className="text-left py-2 text-[color:var(--color-foreground)]">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-[color:var(--color-muted)]">
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">code</td>
                        <td className="py-2 pr-4">Yes</td>
                        <td className="py-2">Template code (TPL-XXX-000 format)</td>
                      </tr>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">name</td>
                        <td className="py-2 pr-4">Yes</td>
                        <td className="py-2">Template name (max 200 chars)</td>
                      </tr>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">description</td>
                        <td className="py-2 pr-4">No</td>
                        <td className="py-2">Template description (max 2000 chars)</td>
                      </tr>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">plan_type</td>
                        <td className="py-2 pr-4">No</td>
                        <td className="py-2">COMPENSATION_PLAN, GOVERNANCE_PLAN, or POLICY_CREATION_PLAN</td>
                      </tr>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">category</td>
                        <td className="py-2 pr-4">No</td>
                        <td className="py-2">Template category</td>
                      </tr>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">tags</td>
                        <td className="py-2 pr-4">No</td>
                        <td className="py-2">Comma or semicolon-separated tags</td>
                      </tr>
                      <tr className="border-b border-[color:var(--color-border)]">
                        <td className="py-2 pr-4 font-mono text-xs">version</td>
                        <td className="py-2 pr-4">No</td>
                        <td className="py-2">Semantic version (default: 1.0.0)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">status</td>
                        <td className="py-2 pr-4">No</td>
                        <td className="py-2">DRAFT, ACTIVE, DEPRECATED, or ARCHIVED (default: DRAFT)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={downloadSampleCSV}
                  className="mt-4 flex items-center gap-2 px-4 py-2 border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors text-sm text-[color:var(--color-foreground)]"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download Sample CSV
                </button>
              </div>
            </div>
          )}

          {/* Status: Parsing */}
          {status === 'parsing' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full mb-4" />
              <p className="text-[color:var(--color-foreground)]">Parsing CSV file...</p>
            </div>
          )}

          {/* Status: Preview */}
          {status === 'preview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex gap-4">
                <div className="flex-1 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[color:var(--color-success-bg)]">
                      <CheckCircledIcon className="h-5 w-5 text-[color:var(--color-success)]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[color:var(--color-foreground)]">{validCount}</p>
                      <p className="text-sm text-[color:var(--color-muted)]">Valid templates</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[color:var(--color-error-bg)]">
                      <CrossCircledIcon className="h-5 w-5 text-[color:var(--color-error)]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[color:var(--color-foreground)]">{invalidCount}</p>
                      <p className="text-sm text-[color:var(--color-muted)]">Invalid templates</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[color:var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-[color:var(--color-primary)]" />
                    <h3 className="font-semibold text-[color:var(--color-foreground)]">Preview</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[color:var(--color-surface-alt)]">
                      <tr>
                        <th className="text-left px-6 py-3 text-[color:var(--color-foreground)]">Status</th>
                        <th className="text-left px-6 py-3 text-[color:var(--color-foreground)]">Code</th>
                        <th className="text-left px-6 py-3 text-[color:var(--color-foreground)]">Name</th>
                        <th className="text-left px-6 py-3 text-[color:var(--color-foreground)]">Type</th>
                        <th className="text-left px-6 py-3 text-[color:var(--color-foreground)]">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTemplates.map((template, index) => (
                        <tr key={index} className="border-t border-[color:var(--color-border)]">
                          <td className="px-6 py-3">
                            {template.isValid ? (
                              <CheckCircledIcon className="h-5 w-5 text-[color:var(--color-success)]" />
                            ) : (
                              <CrossCircledIcon className="h-5 w-5 text-[color:var(--color-error)]" />
                            )}
                          </td>
                          <td className="px-6 py-3 font-mono text-xs text-[color:var(--color-foreground)]">
                            {template.code || '-'}
                          </td>
                          <td className="px-6 py-3 text-[color:var(--color-foreground)]">
                            {template.name || '-'}
                          </td>
                          <td className="px-6 py-3 text-[color:var(--color-muted)]">
                            {template.planType}
                          </td>
                          <td className="px-6 py-3">
                            {template.errors.length > 0 && (
                              <div className="text-[color:var(--color-error)] text-xs">
                                {template.errors.map((err, i) => (
                                  <div key={i}>{err}</div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => { setStatus('idle'); setParsedTemplates([]); }}
                  className="px-6 py-2 border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors text-[color:var(--color-foreground)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={validCount === 0}
                  className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {validCount} Template{validCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* Status: Importing */}
          {status === 'importing' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full mb-4" />
              <p className="text-[color:var(--color-foreground)]">Importing templates...</p>
            </div>
          )}

          {/* Status: Complete */}
          {status === 'complete' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-8 text-center">
                <CheckCircledIcon className="h-16 w-16 text-[color:var(--color-success)] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
                  Import Complete
                </h2>
                <p className="text-[color:var(--color-muted)]">
                  {successCount} of {importResults.length} templates imported successfully
                </p>
              </div>

              {/* Results */}
              {failCount > 0 && (
                <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-error-bg)]">
                    <h3 className="font-semibold text-[color:var(--color-error)]">
                      {failCount} Failed Import{failCount !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {importResults.filter(r => !r.success).map((result, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg">
                        <CrossCircledIcon className="h-5 w-5 text-[color:var(--color-error)]" />
                        <div>
                          <p className="font-medium text-[color:var(--color-foreground)]">
                            {result.code} - {result.name}
                          </p>
                          <p className="text-sm text-[color:var(--color-error)]">{result.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Link
                  href="/templates"
                  className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all"
                >
                  View Templates
                </Link>
                <button
                  onClick={() => { setStatus('idle'); setParsedTemplates([]); setImportResults([]); }}
                  className="px-6 py-2 border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors text-[color:var(--color-foreground)]"
                >
                  Import More
                </button>
              </div>
            </div>
          )}

          {/* Status: Error */}
          {status === 'error' && (
            <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-error)] rounded-xl p-8 text-center">
              <CrossCircledIcon className="h-16 w-16 text-[color:var(--color-error)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
                Import Error
              </h2>
              <p className="text-[color:var(--color-error)] mb-6">{error}</p>
              <button
                onClick={() => { setStatus('idle'); setError(null); }}
                className="px-6 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
