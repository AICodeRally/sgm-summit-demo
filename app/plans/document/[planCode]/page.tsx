'use client';

import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  Cross2Icon,
  DownloadIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import type { PlanSectionWithGaps } from '@/lib/data/plan-with-gaps.data';
import type { HenryScheinPlan } from '@/lib/data/henryschein-plans';

interface Props {
  params: Promise<{ planCode: string }>;
}

export default function PlanDocumentPage({ params }: Props) {
  const { planCode } = use(params);
  const searchParams = useSearchParams();
  const isReviewMode = searchParams.get('view') === 'review';

  const [realPlan, setRealPlan] = useState<HenryScheinPlan | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real Henry Schein plan data WITH gap analysis from API
  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/henryschein/plans/' + planCode + '/gaps');

        if (!response.ok) {
          throw new Error('Plan not found');
        }

        const data = await response.json();
        setRealPlan(data.plan);
        setGapAnalysis(data.gapAnalysis);
      } catch (err) {
        console.error('Error loading plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [planCode]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <ReloadIcon className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Plan...</h1>
          <p className="text-gray-600">Plan code: {planCode}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !realPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Cross2Icon className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plan Not Found</h1>
          <p className="text-gray-600 mb-4">Plan code: {planCode}</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Link
            href="/henryschein/plans"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  // Convert real plan sections to PlanSectionWithGaps format with gap analysis
  const sections: PlanSectionWithGaps[] = realPlan.sections.map((section: any) => {
    // Map gap status to our status format
    const mapGapStatus = (gapStatus: string | undefined) => {
      if (!gapStatus) return 'COMPLETE';
      if (gapStatus === 'FULL') return 'COMPLETE';
      if (gapStatus === 'LIMITED') return 'PARTIAL';
      if (gapStatus === 'NO') return 'MISSING';
      return 'COMPLETE';
    };

    return {
      id: section.id,
      sectionNumber: section.sectionNumber,
      title: section.title,
      content: section.content,
      level: section.level,
      category: section.category,
      order: parseInt(section.sectionNumber?.split('.')[0] || '1') * 10 + parseInt(section.sectionNumber?.split('.')[1] || '0'),
      status: mapGapStatus(section.gapStatus),
      existingContent: section.content,
      gapDetails: section.gapDetails,
      policyName: section.policyName,
      relatedPolicies: section.policyName ? [section.policyName] : [],
      // Include draft policy text for gaps
      draftContent: section.draftContent,
      draftPurpose: section.draftPurpose,
      draftKeyProvisions: section.draftKeyProvisions,
      // Additional required properties
      isRequired: section.category === 'GOVERNANCE_POLICIES' || mapGapStatus(section.gapStatus) === 'MISSING',
      isSelectable: true,
      description: section.gapDetails || '',
    };
  });

  // Calculate stats from gap analysis
  const stats = gapAnalysis?.coverageStats ? {
    complete: gapAnalysis.coverageStats.full || 0,
    partial: gapAnalysis.coverageStats.limited || 0,
    missing: gapAnalysis.coverageStats.no || 0,
    total: gapAnalysis.coverageStats.total || sections.length,
    completeness: Math.round(gapAnalysis.coverageStats.percentage || 0),
  } : {
    complete: sections.filter(s => s.status === 'COMPLETE').length,
    partial: sections.filter(s => s.status === 'PARTIAL').length,
    missing: sections.filter(s => s.status === 'MISSING').length,
    total: sections.length,
    completeness: Math.round((sections.filter(s => s.status === 'COMPLETE').length / sections.length) * 100),
  };

  // Show gap analysis if we have gaps (not a perfectly complete plan)
  const hasGaps = stats.partial > 0 || stats.missing > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800 border-green-300',
        };
      case 'PARTIAL':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-900',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
      case 'MISSING':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-900',
          badge: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-900',
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }
  };

  return (
    <>
      <SetPageTitle
        title="Comp Plan Governance Analysis"
        description="Full plan with governance gaps in context"
      />

      {/* Print styles for review mode */}
      {isReviewMode && (
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      )}

      <div className={`min-h-screen ${isReviewMode ? 'bg-white' : 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50'}`}>
        {/* Header */}
        <div className={`bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm sticky top-0 z-10 ${isReviewMode ? 'no-print' : ''}`}>
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!isReviewMode && (
                  <>
                    <Link
                      href="/henryschein/plans"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Back
                    </Link>
                    <div className="h-6 w-px bg-purple-300"></div>
                  </>
                )}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                    {isReviewMode ? 'Compensation Plan Document' : 'Comp Plan Governance Analysis'}
                  </h1>
                  <p className="text-sm text-gray-600">{realPlan.metadata.planCode} - {realPlan.metadata.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isReviewMode ? (
                  <>
                    <Link
                      href={`/plans/document/${planCode}?view=review`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Review Mode
                    </Link>
                    <span className="text-xs text-gray-500">STATUS:</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold border border-yellow-300">
                      DRAFT
                    </span>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/plans/document/${planCode}`}
                      className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                    >
                      Exit Review Mode
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Print / PDF
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Governance Framework Reference */}
          {!isReviewMode && gapAnalysis && (
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">📋 Governance Framework</h2>
              <p className="text-sm text-gray-700 mb-4">
                This plan is evaluated against <strong>16 standard governance policy areas</strong> required for comprehensive compensation plan compliance.
              </p>
              {gapAnalysis.frameworkPolicies && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {gapAnalysis.frameworkPolicies.map((policy: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="text-purple-600">•</span>
                      <span>{policy}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Governance Gap Analysis Stats */}
          {!isReviewMode && hasGaps && (
            <div className="bg-white rounded-xl border border-purple-200 shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Governance Policy Coverage Analysis</h2>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.complete}</div>
                  <div className="text-sm text-gray-600">Full Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.partial}</div>
                  <div className="text-sm text-gray-600">Limited</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.missing}</div>
                  <div className="text-sm text-gray-600">Not Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Policies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.completeness}%</div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Document */}
          <div className="bg-white rounded-xl border border-purple-200 shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {realPlan.metadata.title}
              </h1>
              <p className="text-lg text-gray-600">
                {realPlan.metadata.division} | Fiscal Year {realPlan.metadata.planYear} | Effective: {realPlan.metadata.effectiveDate}
              </p>
              {!isReviewMode && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
                    {realPlan.metadata.status}
                  </span>
                  <span className="text-xs text-gray-500">Version: {realPlan.metadata.version}</span>
                  <span className="text-xs text-gray-500">Plan Code: {realPlan.metadata.planCode}</span>
                </div>
              )}
            </div>

            {/* Table of Contents */}
            <div className="mb-12 bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
              <div className="space-y-2">
                {sections.map((section) => {
                  const colors = getStatusColor(section.status);
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center justify-between p-2 hover:bg-white rounded transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {!isReviewMode && hasGaps && section.status && (
                          <>
                            {section.status === 'COMPLETE' ? (
                              <CheckCircledIcon className="w-4 h-4 text-green-600" />
                            ) : section.status === 'PARTIAL' ? (
                              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <Cross2Icon className="w-4 h-4 text-red-600" />
                            )}
                          </>
                        )}
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                          {section.sectionNumber} {section.title}
                        </span>
                      </div>
                      {!isReviewMode && hasGaps && section.status && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors.badge}`}>
                          {section.status}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Plan Sections */}
            <div className="space-y-8">
              {sections.map((section, idx) => {
                const colors = getStatusColor(section.status);
                const prevSection = idx > 0 ? sections[idx - 1] : null;
                const showCategoryHeader = !prevSection || prevSection.category !== section.category;

                return (
                  <div key={section.id}>
                    {/* Category Header */}
                    {showCategoryHeader && (
                      <div className="mb-6 pt-8 border-t-4 border-purple-300">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                          {section.category === 'PLAN_OVERVIEW' && '1. Plan Overview'}
                          {section.category === 'PLAN_MEASURES' && '2. Plan Measures'}
                          {section.category === 'PAYOUTS' && '3. Payouts'}
                          {section.category === 'PAYOUT_EXAMPLE' && '4. Payout Example'}
                          {section.category === 'TERMS_CONDITIONS' && '5. Terms and Conditions'}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {section.category === 'PLAN_OVERVIEW' && 'What you\'ll earn and how this plan works'}
                          {section.category === 'PLAN_MEASURES' && 'How you earn incentives - compensation components'}
                          {section.category === 'PAYOUTS' && 'When and how incentives are paid'}
                          {section.category === 'PAYOUT_EXAMPLE' && 'Worked example of incentive calculations'}
                          {section.category === 'TERMS_CONDITIONS' && 'Governance policies and plan administration rules'}
                        </p>
                      </div>
                    )}

                    <div id={section.id} className="scroll-mt-20">
                    {/* Section Header */}
                    <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-gray-300">
                      <div className="flex items-center gap-3">
                        {!isReviewMode && hasGaps && section.status && (
                          <>
                            {section.status === 'COMPLETE' ? (
                              <CheckCircledIcon className="w-6 h-6 text-green-600 flex-none mt-1" />
                            ) : section.status === 'PARTIAL' ? (
                              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-none mt-1" />
                            ) : (
                              <Cross2Icon className="w-6 h-6 text-red-600 flex-none mt-1" />
                            )}
                          </>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {section.sectionNumber} {section.title}
                          </h2>
                          {!isReviewMode && section.relatedPolicies.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Governance: {section.relatedPolicies.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isReviewMode && hasGaps && section.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.badge}`}>
                          {section.status}
                        </span>
                      )}
                    </div>

                    {/* Existing Content */}
                    {section.existingContent && (
                      <div className="mb-6">
                        <div className="prose max-w-none text-gray-800 leading-relaxed">
                          {section.existingContent.split('\n').map((paragraph, idx) => (
                            paragraph.trim() ? (
                              <p key={idx} className="mb-4">{paragraph}</p>
                            ) : (
                              <br key={idx} />
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Draft Content (if PARTIAL or MISSING) */}
                    {section.draftContent && (
                      <div className={`rounded-lg border-2 ${isReviewMode ? 'border-gray-300 bg-white' : `${colors.border} ${colors.bg}`} p-6`}>
                        {!isReviewMode && (
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-300">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                📝 DRAFT POLICY TEMPLATE
                              </span>
                              <span className="text-xs text-gray-600">
                                {section.status === 'MISSING'
                                  ? 'Required policy missing from plan - draft language provided'
                                  : 'Partial coverage - additional language suggested'}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-purple-600">
                              ⚠ LEGAL REVIEW REQUIRED
                            </span>
                          </div>
                        )}

                        {/* Purpose Section */}
                        {section.draftPurpose && !isReviewMode && (
                          <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                            <h4 className="text-sm font-bold text-purple-900 mb-2">Policy Purpose</h4>
                            <p className="text-sm text-gray-700">{section.draftPurpose}</p>
                          </div>
                        )}

                        {/* Full Policy Text */}
                        <div className="prose max-w-none text-gray-900 leading-relaxed text-sm">
                          {section.draftContent.split('\n').map((paragraph, idx) => (
                            paragraph.trim() ? (
                              <p key={idx} className="mb-3">{paragraph}</p>
                            ) : (
                              <br key={idx} />
                            )
                          ))}
                        </div>
                        {!isReviewMode && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-300">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                              Accept Draft
                            </button>
                            <button className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                              Edit Language
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                              Skip
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Document Footer */}
            {!isReviewMode && (
              <div className="mt-12 pt-8 border-t-2 border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Document Status: <strong className="text-yellow-700">DRAFT</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Last Updated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/plans/remediation/${planCode}`}
                      className="px-6 py-3 bg-white border-2 border-purple-400 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                    >
                      Gap Analysis View
                    </Link>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-semibold shadow-lg">
                      Approve & Publish Plan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
