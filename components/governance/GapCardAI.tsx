'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import type { GapEntry } from './DocumentUploader';

interface ValidationResult {
  isGap: boolean;
  confidence: number;
  reasoning: string;
  suggestedGrade: 'A' | 'B' | 'C';
  missingElements: string[];
  validatedAt: string;
}

interface RemediationResult {
  patchText: string;
  insertionPoint: string;
  integrationNotes: string;
  conflictWarnings: string[];
  legalDisclaimer: string;
  confidence: number;
  generatedAt: string;
}

interface GapCardAIProps {
  gap: GapEntry;
  documentId: string;
  planText?: string;
  organizationContext?: {
    name: string;
    state: string;
    industry?: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onValidationComplete?: (gapId: string, result: ValidationResult) => void;
  onRemediationComplete?: (gapId: string, result: RemediationResult) => void;
}

export function GapCardAI({
  gap,
  documentId,
  planText,
  organizationContext,
  isExpanded,
  onToggle,
  onValidationComplete,
  onRemediationComplete,
}: GapCardAIProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [remediation, setRemediation] = useState<RemediationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      CRITICAL: <AlertCircle className="w-4 h-4" />,
      HIGH: <AlertTriangle className="w-4 h-4" />,
      MEDIUM: <Info className="w-4 h-4" />,
      LOW: <Info className="w-4 h-4" />,
    };
    return icons[severity as keyof typeof icons] || icons.LOW;
  };

  const handleValidate = async () => {
    if (!planText) {
      setError('Plan text required for AI validation');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/governance/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          gapId: gap.requirement_id,
          policyCode: gap.policy_code,
          policyName: gap.policy_name,
          requiredElements: gap.evidence || [],
          planTextExcerpt: planText.slice(0, 2000), // First 2000 chars
          detectionReason: `Status: ${gap.status}. ${gap.evidence?.join(', ') || 'No evidence found'}`,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Validation failed');
      }

      const result = await response.json();
      setValidation(result);
      onValidationComplete?.(gap.requirement_id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemediate = async () => {
    if (!organizationContext) {
      setError('Organization context required for remediation');
      return;
    }

    setIsRemediating(true);
    setError(null);

    try {
      const response = await fetch('/api/governance/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          gapId: gap.requirement_id,
          policyCode: gap.policy_code,
          policyName: gap.policy_name,
          gapDescription: `${gap.requirement_name}: ${gap.evidence?.join(', ') || 'Not evidenced in plan'}`,
          existingLanguage: gap.evidence?.length ? gap.evidence.join('\n') : undefined,
          organizationContext,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Remediation failed');
      }

      const result = await response.json();
      setRemediation(result);
      onRemediationComplete?.(gap.requirement_id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remediation failed');
    } finally {
      setIsRemediating(false);
    }
  };

  const handleCopyRemediation = () => {
    if (remediation?.patchText) {
      navigator.clipboard.writeText(remediation.patchText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <div className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${getSeverityBadge(gap.severity)}`}>
            {getSeverityIcon(gap.severity)}
            {gap.severity}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{gap.requirement_name}</p>
            <p className="text-sm text-gray-500">
              {gap.policy_code} - {gap.policy_name}
            </p>
          </div>

          {/* AI Validation Badge */}
          {validation && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              validation.isGap
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {validation.isGap ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              <span>{validation.isGap ? 'AI Confirmed' : 'False Positive'}</span>
              <span className="opacity-60">({validation.confidence}%)</span>
            </div>
          )}

          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            gap.status === 'UNMET' ? 'bg-red-100 text-red-700' :
            gap.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {gap.status}
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
          {/* Evidence */}
          {gap.evidence && gap.evidence.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Evidence Found:</p>
              <ul className="list-disc list-inside space-y-1">
                {gap.evidence.map((ev, i) => (
                  <li key={i} className="text-sm text-gray-600">{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* AI Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleValidate}
              disabled={isValidating || !planText}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {validation ? 'Re-validate' : 'AI Validate'}
            </button>

            <button
              onClick={handleRemediate}
              disabled={isRemediating || !organizationContext}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isRemediating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {remediation ? 'Re-generate' : 'Generate Fix'}
            </button>
          </div>

          {/* Validation Result */}
          {validation && (
            <div className={`p-4 rounded-md border ${
              validation.isGap
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {validation.isGap ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span className={`font-semibold ${
                  validation.isGap ? 'text-red-800' : 'text-green-800'
                }`}>
                  {validation.isGap ? 'Gap Confirmed' : 'False Positive Detected'}
                </span>
                <span className={`text-sm ml-auto ${
                  validation.isGap ? 'text-red-600' : 'text-green-600'
                }`}>
                  {validation.confidence}% confidence
                </span>
              </div>
              <p className={`text-sm ${
                validation.isGap ? 'text-red-700' : 'text-green-700'
              }`}>
                {validation.reasoning}
              </p>
              {validation.missingElements.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700">Missing Elements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {validation.missingElements.map((el, i) => (
                      <li key={i}>{el}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Suggested Grade: <span className="font-medium">{validation.suggestedGrade}</span>
              </p>
            </div>
          )}

          {/* Remediation Result */}
          {remediation && (
            <div className="p-4 rounded-md border bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Generated Remediation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">
                    {remediation.confidence}% confidence
                  </span>
                  <button
                    onClick={handleCopyRemediation}
                    className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-md p-3 border border-blue-200 mb-3">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                  {remediation.patchText}
                </pre>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-blue-700">
                  <span className="font-medium">Insert at:</span> {remediation.insertionPoint}
                </p>
                <p className="text-blue-700">
                  <span className="font-medium">Integration:</span> {remediation.integrationNotes}
                </p>

                {remediation.conflictWarnings.length > 0 && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium text-yellow-800 text-xs mb-1">Potential Conflicts:</p>
                    <ul className="list-disc list-inside text-yellow-700 text-xs">
                      {remediation.conflictWarnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-500 italic mt-2">
                  {remediation.legalDisclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
