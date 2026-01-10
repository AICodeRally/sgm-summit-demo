'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, AlertCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import type { AnalysisResult, GapEntry, RiskTrigger } from './DocumentUploader';
import { GapCardAI } from './GapCardAI';

interface AnalysisResultsProps {
  result: AnalysisResult;
  fileName: string;
  documentId: string;
  planText?: string;
  organizationContext?: {
    name: string;
    state: string;
    industry?: string;
  };
  onApplyPatch?: (gap: GapEntry) => void;
  onViewPatches?: () => void;
  onViewChecklist?: () => void;
}

export function AnalysisResults({
  result,
  fileName,
  documentId,
  planText,
  organizationContext,
  onApplyPatch,
  onViewPatches,
  onViewChecklist,
}: AnalysisResultsProps) {
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const toggleGap = (requirementId: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(requirementId)) {
        next.delete(requirementId);
      } else {
        next.add(requirementId);
      }
      return next;
    });
  };

  const getCoverageGrade = (score: number) => {
    if (score >= 0.8) return { grade: 'A', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 0.4) return { grade: 'B', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { grade: 'C', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const getLiabilityColor = (score: number) => {
    if (score >= 4) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[severity as keyof typeof badges] || badges.LOW;
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      CRITICAL: <AlertCircle className="w-4 h-4 text-red-600" />,
      HIGH: <AlertTriangle className="w-4 h-4 text-orange-600" />,
      MEDIUM: <Info className="w-4 h-4 text-yellow-600" />,
      LOW: <Info className="w-4 h-4 text-blue-600" />,
    };
    return icons[severity as keyof typeof icons] || icons.LOW;
  };

  const filteredGaps = selectedSeverity === 'all'
    ? result.gaps
    : result.gaps.filter((g) => g.severity === selectedSeverity);

  const gapsBySeverity = {
    CRITICAL: result.gaps.filter((g) => g.severity === 'CRITICAL').length,
    HIGH: result.gaps.filter((g) => g.severity === 'HIGH').length,
    MEDIUM: result.gaps.filter((g) => g.severity === 'MEDIUM').length,
    LOW: result.gaps.filter((g) => g.severity === 'LOW').length,
  };

  const coverageGrade = getCoverageGrade(result.coverage_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gap Analysis Results
            </h2>
            <p className="text-sm text-gray-500">
              {fileName} • Analyzed {new Date(result.analyzed_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            {onViewPatches && (
              <button
                onClick={onViewPatches}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                View Patches
              </button>
            )}
            {onViewChecklist && (
              <button
                onClick={onViewChecklist}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Checklist
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Coverage Grade"
            value={coverageGrade.grade}
            subtitle={`${(result.coverage_score * 100).toFixed(1)}%`}
            className={coverageGrade.color}
          />
          <MetricCard
            label="Liability Score"
            value={result.liability_score.toFixed(1)}
            subtitle="out of 5.0"
            className={getLiabilityColor(result.liability_score)}
          />
          <MetricCard
            label="Total Gaps"
            value={result.total_gaps.toString()}
            subtitle={`of ${result.total_requirements} requirements`}
            className="bg-gray-100 text-gray-800 border-gray-200"
          />
          <MetricCard
            label="Risk Triggers"
            value={result.risk_triggers.length.toString()}
            subtitle="patterns detected"
            className="bg-purple-100 text-purple-800 border-purple-200"
          />
        </div>
      </div>

      {/* Risk Triggers */}
      {result.risk_triggers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Triggers Detected
          </h3>
          <div className="space-y-3">
            {result.risk_triggers.map((trigger) => (
              <RiskTriggerCard key={trigger.id} trigger={trigger} />
            ))}
          </div>
        </div>
      )}

      {/* Gap Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Policy Gaps ({filteredGaps.length})
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
              All ({result.gaps.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Critical ({gapsBySeverity.CRITICAL})
            </button>
            <button
              onClick={() => setSelectedSeverity('HIGH')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'HIGH'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              High ({gapsBySeverity.HIGH})
            </button>
            <button
              onClick={() => setSelectedSeverity('MEDIUM')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'MEDIUM'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Medium ({gapsBySeverity.MEDIUM})
            </button>
            <button
              onClick={() => setSelectedSeverity('LOW')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'LOW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Low ({gapsBySeverity.LOW})
            </button>
          </div>
        </div>

        {/* Gap List */}
        <div className="space-y-2">
          {filteredGaps.map((gap) => (
            <GapCardAI
              key={gap.requirement_id}
              gap={gap}
              documentId={documentId}
              planText={planText}
              organizationContext={organizationContext}
              isExpanded={expandedGaps.has(gap.requirement_id)}
              onToggle={() => toggleGap(gap.requirement_id)}
            />
          ))}
        </div>

        {filteredGaps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {selectedSeverity.toLowerCase()} severity gaps found
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle: string;
  className: string;
}

function MetricCard({ label, value, subtitle, className }: MetricCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <p className="text-xs font-medium mb-1 opacity-75">{label}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{subtitle}</p>
    </div>
  );
}

interface RiskTriggerCardProps {
  trigger: RiskTrigger;
}

function RiskTriggerCard({ trigger }: RiskTriggerCardProps) {
  const getImpactColor = (impact: number) => {
    if (impact >= 3) return 'bg-red-100 border-red-200';
    if (impact >= 2) return 'bg-orange-100 border-orange-200';
    return 'bg-yellow-100 border-yellow-200';
  };

  return (
    <div className={`border rounded-md p-4 ${getImpactColor(trigger.impact)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{trigger.name}</h4>
          <p className="text-sm text-gray-700 mt-1">{trigger.description}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-white rounded-md ml-4">
          Impact: +{trigger.impact}
        </span>
      </div>
      {trigger.matched_patterns.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-1">
            Matched Patterns:
          </p>
          <div className="flex flex-wrap gap-1">
            {trigger.matched_patterns.map((pattern, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-white rounded-md text-gray-700"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

