'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface PatchViewerProps {
  documentId: string;
  fileName: string;
  onDownload?: () => void;
}

interface ParsedPatch {
  number: number;
  title: string;
  severity: string;
  policy: string;
  description: string;
  insertionPoint: string;
  language: string;
  stateNotes?: string;
  customization?: string;
  fullText: string;
}

export function PatchViewer({ documentId, fileName, onDownload }: PatchViewerProps) {
  const [patches, setPatches] = useState<string>('');
  const [parsedPatches, setParsedPatches] = useState<ParsedPatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPatches, setExpandedPatches] = useState<Set<number>>(new Set([1])); // Expand first patch by default
  const [copiedPatch, setCopiedPatch] = useState<number | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    fetchPatches();
  }, [documentId]);

  const fetchPatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/governance/patches/${documentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch patches');
      }

      const text = await response.text();
      setPatches(text);
      setParsedPatches(parsePatches(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const parsePatches = (text: string): ParsedPatch[] => {
    const patchSeparator = '--------------------------------------------------------------------------------';
    const sections = text.split(patchSeparator).filter((s) => s.trim());

    const parsed: ParsedPatch[] = [];

    sections.forEach((section, index) => {
      // Extract patch number and title from line like "PATCH #1: SCP-005 - Short-Term Deferral Safe Harbor"
      const titleMatch = section.match(/PATCH #(\d+):\s*(.+?)(?:\n|$)/);
      if (!titleMatch) return;

      const number = parseInt(titleMatch[1]);
      const title = titleMatch[2].trim();

      // Extract severity
      const severityMatch = section.match(/Severity:\s+(\w+)/);
      const severity = severityMatch ? severityMatch[1] : 'UNKNOWN';

      // Extract policy
      const policyMatch = section.match(/Policy:\s+(.+?)(?:\n|$)/);
      const policy = policyMatch ? policyMatch[1].trim() : 'Unknown Policy';

      // Extract description
      const descMatch = section.match(/Gap Description:\s+(.+?)(?:\n\n|Insertion Point:)/s);
      const description = descMatch ? descMatch[1].trim() : '';

      // Extract insertion point
      const insertionMatch = section.match(/Insertion Point:\s+(.+?)(?:\n|$)/);
      const insertionPoint = insertionMatch ? insertionMatch[1].trim() : 'Unknown';

      // Extract recommended language (between the box and placeholders or state notes)
      const languageMatch = section.match(/└[─]+┘\s*\n\n([\s\S]+?)(?:\n\s*Placeholders|State-Specific|$)/);
      const language = languageMatch ? languageMatch[1].trim() : '';

      // Extract state notes
      const stateMatch = section.match(/State-Specific Considerations:\s+([\s\S]+?)(?:\n\n|$)/);
      const stateNotes = stateMatch ? stateMatch[1].trim() : undefined;

      // Extract customization notes
      const customMatch = section.match(/Placeholders to Customize:\s+([\s\S]+?)(?:\n\n|State-Specific|$)/);
      const customization = customMatch ? customMatch[1].trim() : undefined;

      parsed.push({
        number,
        title,
        severity,
        policy,
        description,
        insertionPoint,
        language,
        stateNotes,
        customization,
        fullText: section,
      });
    });

    return parsed;
  };

  const togglePatch = (number: number) => {
    setExpandedPatches((prev) => {
      const next = new Set(prev);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  };

  const copyPatch = async (patch: ParsedPatch) => {
    await navigator.clipboard.writeText(patch.language);
    setCopiedPatch(patch.number);
    setTimeout(() => setCopiedPatch(null), 2000);
  };

  const downloadPatches = () => {
    const blob = new Blob([patches], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentId}_REMEDIATION_PATCHES.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredPatches = selectedSeverity === 'all'
    ? parsedPatches
    : parsedPatches.filter((p) => p.severity === selectedSeverity);

  const patchesBySeverity = {
    CRITICAL: parsedPatches.filter((p) => p.severity === 'CRITICAL').length,
    HIGH: parsedPatches.filter((p) => p.severity === 'HIGH').length,
    MEDIUM: parsedPatches.filter((p) => p.severity === 'MEDIUM').length,
    LOW: parsedPatches.filter((p) => p.severity === 'LOW').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading patches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium mb-2">Failed to load patches</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Remediation Patches
            </h2>
            <p className="text-sm text-gray-500">{fileName}</p>
          </div>
          <button
            onClick={downloadPatches}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-900">
            <strong>Instructions:</strong> Review each patch with Legal counsel, customize placeholder values [in brackets],
            insert at designated insertion points, then re-run analysis to verify improvements.
          </p>
        </div>
      </div>

      {/* Severity Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredPatches.length} Patch{filteredPatches.length !== 1 ? 'es' : ''}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({parsedPatches.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Critical ({patchesBySeverity.CRITICAL})
            </button>
            <button
              onClick={() => setSelectedSeverity('HIGH')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'HIGH'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              High ({patchesBySeverity.HIGH})
            </button>
            <button
              onClick={() => setSelectedSeverity('MEDIUM')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'MEDIUM'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Medium ({patchesBySeverity.MEDIUM})
            </button>
            <button
              onClick={() => setSelectedSeverity('LOW')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'LOW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Low ({patchesBySeverity.LOW})
            </button>
          </div>
        </div>

        {/* Patch List */}
        <div className="space-y-3">
          {filteredPatches.map((patch) => (
            <div
              key={patch.number}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => togglePatch(patch.number)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {expandedPatches.has(patch.number) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-mono text-gray-500">#{patch.number}</span>
                  <div
                    className={`px-2 py-1 rounded-md text-xs font-medium border ${getSeverityBadge(
                      patch.severity
                    )}`}
                  >
                    {patch.severity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{patch.title}</p>
                    <p className="text-sm text-gray-500 truncate">{patch.policy}</p>
                  </div>
                </div>
              </button>

              {expandedPatches.has(patch.number) && (
                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                  {/* Description */}
                  {patch.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Gap Description:</p>
                      <p className="text-sm text-gray-600">{patch.description}</p>
                    </div>
                  )}

                  {/* Insertion Point */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Insertion Point:</p>
                    <p className="text-sm text-gray-600">{patch.insertionPoint}</p>
                  </div>

                  {/* Recommended Language */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Recommended Language:</p>
                      <button
                        onClick={() => copyPatch(patch)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        {copiedPatch === patch.number ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {patch.language}
                    </pre>
                  </div>

                  {/* Customization Notes */}
                  {patch.customization && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Customization Notes:</p>
                      <pre className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {patch.customization}
                      </pre>
                    </div>
                  )}

                  {/* State-Specific Notes */}
                  {patch.stateNotes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">State-Specific Considerations:</p>
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {patch.stateNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPatches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {selectedSeverity.toLowerCase()} severity patches found
          </div>
        )}
      </div>
    </div>
  );
}
