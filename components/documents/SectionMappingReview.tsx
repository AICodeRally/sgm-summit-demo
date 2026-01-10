'use client';

/**
 * Section Mapping Review Component
 *
 * Interactive UI for reviewing and adjusting document section mappings.
 * Features:
 * - Split view: Parsed sections (left) | Template sections (right)
 * - Drag-and-drop support for remapping
 * - JSON preview on hover
 * - Accept/reject/modify actions
 * - Confidence score visualization
 * - Alternative suggestions
 */

import { useState, useCallback } from 'react';
import {
  CheckCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  QuestionMarkCircledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagicWandIcon,
} from '@radix-ui/react-icons';
import type { SectionMapping } from '@/lib/services/section-mapping';
import type { ParsedSection } from '@/lib/contracts/content-json.contract';
import type { TemplateSection } from '@/lib/data/plan-template-library.data';

interface SectionMappingReviewProps {
  mappings: SectionMapping[];
  onMappingsUpdated: (updated: SectionMapping[]) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  templateSections?: TemplateSection[];
}

export default function SectionMappingReview({
  mappings,
  onMappingsUpdated,
  onAcceptAll,
  onRejectAll,
  templateSections,
}: SectionMappingReviewProps) {
  const [expandedMappingIds, setExpandedMappingIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(
    null
  );
  const [showJSONPreview, setShowJSONPreview] = useState<string | null>(null);

  // Statistics
  const stats = {
    total: mappings.length,
    accepted: mappings.filter((m) => m.status === 'ACCEPTED').length,
    pending: mappings.filter((m) => m.status === 'PENDING').length,
    rejected: mappings.filter((m) => m.status === 'REJECTED').length,
    avgConfidence:
      mappings.reduce((sum, m) => sum + m.confidenceScore, 0) /
      (mappings.length || 1),
  };

  // Toggle mapping expansion
  const toggleExpanded = useCallback((mappingId: string) => {
    setExpandedMappingIds((prev) => {
      const next = new Set(prev);
      if (next.has(mappingId)) {
        next.delete(mappingId);
      } else {
        next.add(mappingId);
      }
      return next;
    });
  }, []);

  // Accept mapping
  const handleAccept = useCallback(
    (mappingId: string) => {
      const updated = mappings.map((m) =>
        m.id === mappingId ? { ...m, status: 'ACCEPTED' as const } : m
      );
      onMappingsUpdated(updated);
    },
    [mappings, onMappingsUpdated]
  );

  // Reject mapping
  const handleReject = useCallback(
    (mappingId: string) => {
      const updated = mappings.map((m) =>
        m.id === mappingId ? { ...m, status: 'REJECTED' as const } : m
      );
      onMappingsUpdated(updated);
    },
    [mappings, onMappingsUpdated]
  );

  // Remap to different template section
  const handleRemap = useCallback(
    (mappingId: string, newTemplateSectionId: string) => {
      if (!templateSections) return;

      const newTemplateSection = templateSections.find(
        (t) => t.id === newTemplateSectionId
      );
      if (!newTemplateSection) return;

      const updated = mappings.map((m) =>
        m.id === mappingId
          ? {
              ...m,
              templateSectionId: newTemplateSectionId,
              templateSection: newTemplateSection,
              status: 'MODIFIED' as const,
              mappingMethod: 'MANUAL' as const,
              confidenceScore: 1.0, // User override = 100% confidence
            }
          : m
      );
      onMappingsUpdated(updated);
    },
    [mappings, templateSections, onMappingsUpdated]
  );

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircledIcon className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <Cross2Icon className="w-5 h-5 text-red-600" />;
      case 'MODIFIED':
        return <MagicWandIcon className="w-5 h-5 text-blue-600" />;
      case 'PENDING':
      default:
        return <QuestionMarkCircledIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Get method icon/badge
  const getMethodBadge = (method: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      EXACT: { label: 'Exact', color: 'bg-green-100 text-green-800' },
      FUZZY: { label: 'Fuzzy', color: 'bg-blue-100 text-blue-800' },
      AI_SUGGESTED: { label: 'AI', color: 'bg-purple-100 text-purple-800' },
      MANUAL: { label: 'Manual', color: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[method] || badges.MANUAL;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  // Get confidence bar color
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.7) return 'bg-blue-500';
    if (score >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with statistics */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Section Mapping Review
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and adjust automatic section mappings
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onRejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reject All
            </button>
            <button
              onClick={onAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Accept All ({stats.pending})
            </button>
          </div>
        </div>

        {/* Statistics bar */}
        <div className="mt-4 grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Sections</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
            <div className="text-xs text-gray-600">Accepted</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-xs text-gray-600">Rejected</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {(stats.avgConfidence * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Mapping list */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        <div className="space-y-3">
          {mappings.map((mapping, index) => {
            const isExpanded = expandedMappingIds.has(mapping.id);

            return (
              <div
                key={mapping.id}
                className={`bg-white rounded-lg border-2 transition-all ${
                  selectedMappingId === mapping.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMappingId(mapping.id)}
              >
                {/* Mapping header */}
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Status icon */}
                      <div className="mt-1">{getStatusIcon(mapping.status)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Index and title */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            "{mapping.parsedSection.detectedTitle}"
                          </span>
                          {getMethodBadge(mapping.mappingMethod)}
                        </div>

                        {/* Mapping arrow */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-blue-600">
                            {mapping.templateSection.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({mapping.templateSection.sectionNumber})
                          </span>
                        </div>

                        {/* Confidence bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div
                              className={`h-2 rounded-full ${getConfidenceColor(
                                mapping.confidenceScore
                              )}`}
                              style={{
                                width: `${mapping.confidenceScore * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(mapping.confidenceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {mapping.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(mapping.id);
                              }}
                              className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                              title="Accept mapping"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(mapping.id);
                              }}
                              className="px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                              title="Reject mapping"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Expand/collapse button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(mapping.id);
                          }}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Parsed section preview */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Parsed Section
                        </h4>
                        <div className="bg-white border border-gray-200 rounded p-3 text-sm">
                          <div className="text-gray-600 mb-2">
                            <strong>Title:</strong>{' '}
                            {mapping.parsedSection.detectedTitle}
                          </div>
                          <div className="text-gray-600 mb-2">
                            <strong>Blocks:</strong>{' '}
                            {mapping.parsedSection.blocks.length}
                          </div>
                          <div className="text-gray-600">
                            <strong>Detection:</strong>{' '}
                            {mapping.parsedSection.detectionMethod}
                          </div>
                          <button
                            onClick={() =>
                              setShowJSONPreview(
                                showJSONPreview === mapping.id ? null : mapping.id
                              )
                            }
                            className="mt-2 text-xs text-blue-600 hover:underline"
                          >
                            {showJSONPreview === mapping.id
                              ? 'Hide JSON'
                              : 'Show JSON'}
                          </button>
                          {showJSONPreview === mapping.id && (
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-48">
                              {JSON.stringify(mapping.parsedSection, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>

                      {/* Template section info */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Template Section
                        </h4>
                        <div className="bg-white border border-gray-200 rounded p-3 text-sm">
                          <div className="text-gray-600 mb-2">
                            <strong>Title:</strong>{' '}
                            {mapping.templateSection.title}
                          </div>
                          <div className="text-gray-600 mb-2">
                            <strong>Number:</strong>{' '}
                            {mapping.templateSection.sectionNumber}
                          </div>
                          <div className="text-gray-600 mb-2">
                            <strong>Category:</strong>{' '}
                            {mapping.templateSection.category}
                          </div>
                          {mapping.templateSection.description && (
                            <div className="text-gray-600 text-xs mt-2 italic">
                              {mapping.templateSection.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alternative suggestions */}
                    {mapping.alternativeSuggestions &&
                      mapping.alternativeSuggestions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Alternative Suggestions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {mapping.alternativeSuggestions.map((alt, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  handleRemap(mapping.id, alt.templateSectionId)
                                }
                                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <div className="font-medium text-gray-900">
                                  {alt.templateSection.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(alt.score * 100).toFixed(1)}% confidence
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Remap dropdown (if template sections provided) */}
                    {templateSections && (
                      <div className="mt-4">
                        <label className="text-sm font-semibold text-gray-700">
                          Or choose a different section:
                        </label>
                        <select
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          onChange={(e) => handleRemap(mapping.id, e.target.value)}
                          value={mapping.templateSectionId}
                        >
                          {templateSections.map((ts) => (
                            <option key={ts.id} value={ts.id}>
                              {ts.sectionNumber} - {ts.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
