'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  Cross2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  GOVERNANCE_FRAMEWORK_POLICIES,
  getPlanCoverage,
  getPlanCoverageSummary,
  type PolicyCoverageStatus,
} from '@/lib/data/governance-framework.data';

interface Props {
  params: Promise<{ planCode: string }>;
}

export default function PlanRemediationPage({ params }: Props) {
  const { planCode } = use(params);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | PolicyCoverageStatus>('ALL');

  const coverage = getPlanCoverage(planCode);
  const summary = getPlanCoverageSummary(planCode);

  const toggleSection = (policyId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: PolicyCoverageStatus) => {
    switch (status) {
      case 'COVERED':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800',
        };
      case 'NEEDS_WORK':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-900',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800',
        };
      case 'MISSING':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-900',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredCoverage =
    selectedStatus === 'ALL'
      ? coverage
      : coverage.filter((c) => c.status === selectedStatus);

  return (
    <>
      <SetPageTitle
        title="Plan Remediation"
        description="Governance Gap Analysis & Draft Language"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/henryschein/plans"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Plans
                </Link>
                <div className="h-6 w-px bg-purple-300"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                    Plan Remediation Workspace
                  </h1>
                  <p className="text-sm text-gray-600">{planCode} - Gap Analysis & Draft Language</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">STATUS:</span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold border border-yellow-300">
                  DRAFT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Summary */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-purple-200 shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Governance Coverage Summary</h2>

            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-300 p-4">
                <div className="text-3xl font-bold text-green-700">{summary.covered}</div>
                <div className="text-sm text-green-600 font-medium">Covered</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-300 p-4">
                <div className="text-3xl font-bold text-yellow-700">{summary.needsWork}</div>
                <div className="text-sm text-yellow-600 font-medium">Needs Work</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-300 p-4">
                <div className="text-3xl font-bold text-red-700">{summary.missing}</div>
                <div className="text-sm text-red-600 font-medium">Missing</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-300 p-4">
                <div className="text-3xl font-bold text-purple-700">{summary.total}</div>
                <div className="text-sm text-purple-600 font-medium">Total Policies</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300 p-4">
                <div className="text-3xl font-bold text-blue-700">{summary.completenessScore}%</div>
                <div className="text-sm text-blue-600 font-medium">Completeness</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                }`}
              >
                All ({coverage.length})
              </button>
              <button
                onClick={() => setSelectedStatus('COVERED')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'COVERED'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-green-200 text-gray-700 hover:bg-green-50'
                }`}
              >
                Covered ({summary.covered})
              </button>
              <button
                onClick={() => setSelectedStatus('NEEDS_WORK')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'NEEDS_WORK'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white border border-yellow-200 text-gray-700 hover:bg-yellow-50'
                }`}
              >
                Needs Work ({summary.needsWork})
              </button>
              <button
                onClick={() => setSelectedStatus('MISSING')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'MISSING'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-red-200 text-gray-700 hover:bg-red-50'
                }`}
              >
                Missing ({summary.missing})
              </button>
            </div>
          </div>

          {/* Policy Coverage List */}
          <div className="space-y-3">
            {GOVERNANCE_FRAMEWORK_POLICIES.map((policy) => {
              const policyCoverage = coverage.find((c) => c.policyId === policy.id);
              if (!policyCoverage) return null;

              if (selectedStatus !== 'ALL' && policyCoverage.status !== selectedStatus) {
                return null;
              }

              const isExpanded = expandedSections.has(policy.id);
              const colors = getStatusColor(policyCoverage.status);

              return (
                <div
                  key={policy.id}
                  className={`bg-white rounded-lg border-2 ${colors.border} shadow-md overflow-hidden transition-all`}
                >
                  {/* Policy Header */}
                  <button
                    onClick={() => toggleSection(policy.id)}
                    className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      isExpanded ? colors.bg : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? (
                        <ChevronDownIcon className={`w-5 h-5 ${colors.icon}`} />
                      ) : (
                        <ChevronRightIcon className={`w-5 h-5 ${colors.icon}`} />
                      )}

                      {policyCoverage.status === 'COVERED' ? (
                        <CheckCircledIcon className={`w-6 h-6 ${colors.icon}`} />
                      ) : policyCoverage.status === 'NEEDS_WORK' ? (
                        <ExclamationTriangleIcon className={`w-6 h-6 ${colors.icon}`} />
                      ) : (
                        <Cross2Icon className={`w-6 h-6 ${colors.icon}`} />
                      )}

                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-lg ${colors.text}`}>{policy.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(policy.priority)}`}>
                            {policy.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{policy.description}</p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                      {policyCoverage.status.replace('_', ' ')}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className={`px-6 py-4 border-t ${colors.border} ${colors.bg}`}>
                      {/* Existing Language (if present) */}
                      {policyCoverage.existingLanguage && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">
                            ✅ Existing Language in Plan:
                          </h4>
                          <div className="bg-white rounded border border-gray-300 p-3">
                            <p className="text-sm text-gray-800">{policyCoverage.existingLanguage}</p>
                          </div>
                        </div>
                      )}

                      {/* Draft Additive Language (if NEEDS_WORK) */}
                      {policyCoverage.draftAdditiveLanguage && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-yellow-700 mb-2">
                            ➕ Draft Additive Language:
                          </h4>
                          <div className="bg-yellow-50 rounded border-2 border-yellow-400 p-4">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                              {policyCoverage.draftAdditiveLanguage}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Draft Missing Language (if MISSING) */}
                      {policyCoverage.draftMissingLanguage && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-red-700 mb-2">
                            ❌ Draft Missing Section (to be added):
                          </h4>
                          <div className="bg-red-50 rounded border-2 border-red-400 p-4">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                              {policyCoverage.draftMissingLanguage}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {policyCoverage.notes && (
                        <div className="bg-blue-50 rounded border border-blue-300 p-3">
                          <p className="text-xs text-blue-800">
                            <strong>Note:</strong> {policyCoverage.notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          Accept Draft
                        </button>
                        <button className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                          Edit Language
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Skip for Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
