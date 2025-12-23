'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface PolicyImpact {
  policyName: string;
  policyArea: string;
  description: string;
  plansAffected: number;
  gapsAddressed: number;
  priority: 'MUST HAVE' | 'SHOULD HAVE' | 'NICE TO HAVE';
  riskMitigated: string;
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'DRAFT' | 'FINAL';
  affectedPlans: string[];
}

export default function HenryScheinPolicies() {
  const [policies, setPolicies] = useState<PolicyImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyImpact | null>(null);

  useEffect(() => {
    // Calculate policy impact from plans data
    fetch('/api/henryschein/plans')
      .then((res) => res.json())
      .then((data) => {
        const policyImpacts = calculatePolicyImpacts(data.plans || []);
        setPolicies(policyImpacts);
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
        setPolicies([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const calculatePolicyImpacts = (plans: any[]): PolicyImpact[] => {
    const policyMappings = [
      {
        policyName: 'Windfall/Large Deal Policy',
        policyArea: 'Windfall/Large Deals',
        description: 'Establishes approval workflows, documentation requirements, and compensation caps for exceptionally large deals (>$250K GP). Includes CRB review process, legal sign-off, and customer commitment verification.',
        riskMitigated: '$850K',
        implementationComplexity: 'HIGH' as const,
        priority: 'MUST HAVE' as const,
      },
      {
        policyName: 'Section 409A Compliance Policy',
        policyArea: 'Compliance (409A, State Wage)',
        description: 'Ensures all deferred compensation elements comply with IRS Section 409A requirements. Defines permissible deferral elections, distribution triggers, and plan administration requirements to avoid 20% penalty tax.',
        riskMitigated: '$420K',
        implementationComplexity: 'MEDIUM' as const,
        priority: 'MUST HAVE' as const,
      },
      {
        policyName: 'State Wage Law Compliance Policy',
        policyArea: 'Compliance (409A, State Wage)',
        description: 'Addresses state-specific wage payment laws including frequency, final pay timing, and commission treatment. Covers CA, NY, MA, IL requirements and multi-state rep management.',
        riskMitigated: '$380K',
        implementationComplexity: 'MEDIUM' as const,
        priority: 'MUST HAVE' as const,
      },
      {
        policyName: 'Clawback & Recovery Policy',
        policyArea: 'Clawback/Recovery',
        description: 'Defines circumstances and procedures for recovering unearned compensation including customer returns, cancelled orders, AR write-offs, and financial restatements. Includes SOX 404 and Dodd-Frank clawback requirements.',
        riskMitigated: '$310K',
        implementationComplexity: 'LOW' as const,
        priority: 'SHOULD HAVE' as const,
      },
      {
        policyName: 'Quota Management Policy',
        policyArea: 'Quota Management',
        description: 'Standardizes quota-setting methodology, mid-period adjustment rules, and dispute resolution. Includes fairness criteria, documentation requirements, and manager approval workflows.',
        riskMitigated: '$265K',
        implementationComplexity: 'MEDIUM' as const,
        priority: 'SHOULD HAVE' as const,
      },
      {
        policyName: 'SPIF Governance Policy',
        policyArea: 'SPIF Governance',
        description: 'Controls for special incentive programs including approval thresholds, budget limits, legal review requirements, and documentation standards. Prevents unauthorized SPIFs and ensures alignment with company strategy.',
        riskMitigated: '$180K',
        implementationComplexity: 'LOW' as const,
        priority: 'NICE TO HAVE' as const,
      },
    ];

    return policyMappings.map((policy) => {
      let plansAffected = 0;
      let gapsAddressed = 0;
      const affectedPlans: string[] = [];

      plans.forEach((plan: any) => {
        const coverage = plan.policyCoverage?.[policy.policyArea];
        if (coverage && (coverage.coverage === 'NO' || coverage.coverage === 'LIMITED')) {
          plansAffected++;
          gapsAddressed++;
          affectedPlans.push(plan.planName);
        }
      });

      return {
        ...policy,
        plansAffected,
        gapsAddressed,
        status: 'DRAFT' as const,
        affectedPlans,
      };
    });
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'MUST HAVE') return 'bg-red-100 text-red-800 border-red-300';
    if (priority === 'SHOULD HAVE') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getComplexityColor = (complexity: string) => {
    if (complexity === 'HIGH') return 'text-red-600';
    if (complexity === 'MEDIUM') return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading policies...</p>
      </div>
    );
  }

  const totalRiskMitigated = policies.reduce((sum, p) => {
    const amount = parseFloat(p.riskMitigated.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  const mustHavePolicies = policies.filter((p) => p.priority === 'MUST HAVE');
  const shouldHavePolicies = policies.filter((p) => p.priority === 'SHOULD HAVE');
  const niceToHavePolicies = policies.filter((p) => p.priority === 'NICE TO HAVE');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/henryschein"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BHG Policy Recommendations</h1>
                <p className="text-sm text-gray-600">{policies.length} DRAFT policies available for implementation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
            <p className="text-sm font-medium text-blue-900">Total Policies</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{policies.length}</p>
            <p className="text-xs text-blue-700 mt-2">All in DRAFT status</p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <p className="text-sm font-medium text-red-900">MUST HAVE</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{mustHavePolicies.length}</p>
            <p className="text-xs text-red-700 mt-2">Implement in Q1 2026</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <p className="text-sm font-medium text-yellow-900">SHOULD HAVE</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{shouldHavePolicies.length}</p>
            <p className="text-xs text-yellow-700 mt-2">Implement in Q2 2026</p>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <p className="text-sm font-medium text-green-900">Risk Mitigated</p>
            <p className="text-4xl font-bold text-green-600 mt-2">${(totalRiskMitigated / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-700 mt-2">Potential savings over 3 years</p>
          </div>
        </div>

        {/* Policies List */}
        <div className="space-y-6">
          {/* MUST HAVE Section */}
          {mustHavePolicies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                MUST HAVE - Q1 2026 Implementation
              </h2>
              <div className="space-y-4">
                {mustHavePolicies.map((policy) => (
                  <div
                    key={policy.policyName}
                    className="bg-white rounded-lg border-2 border-red-200 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{policy.policyName}</h3>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                            {policy.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{policy.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-3xl font-bold text-red-600">{policy.plansAffected}</p>
                        <p className="text-xs text-gray-600">plans affected</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Priority</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getPriorityColor(policy.priority)}`}>
                          {policy.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Gaps Addressed</p>
                        <p className="text-lg font-bold text-gray-900">{policy.gapsAddressed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Risk Mitigated</p>
                        <p className="text-lg font-bold text-green-600">{policy.riskMitigated}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Implementation</p>
                        <p className={`text-lg font-bold ${getComplexityColor(policy.implementationComplexity)}`}>
                          {policy.implementationComplexity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Click to view affected plans →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHOULD HAVE Section */}
          {shouldHavePolicies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
                <CheckCircledIcon className="w-5 h-5" />
                SHOULD HAVE - Q2 2026 Implementation
              </h2>
              <div className="space-y-4">
                {shouldHavePolicies.map((policy) => (
                  <div
                    key={policy.policyName}
                    className="bg-white rounded-lg border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{policy.policyName}</h3>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                            {policy.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{policy.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-3xl font-bold text-yellow-600">{policy.plansAffected}</p>
                        <p className="text-xs text-gray-600">plans affected</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Priority</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getPriorityColor(policy.priority)}`}>
                          {policy.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Gaps Addressed</p>
                        <p className="text-lg font-bold text-gray-900">{policy.gapsAddressed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Risk Mitigated</p>
                        <p className="text-lg font-bold text-green-600">{policy.riskMitigated}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Implementation</p>
                        <p className={`text-lg font-bold ${getComplexityColor(policy.implementationComplexity)}`}>
                          {policy.implementationComplexity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Click to view affected plans →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NICE TO HAVE Section */}
          {niceToHavePolicies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                <CheckCircledIcon className="w-5 h-5" />
                NICE TO HAVE - Q3 2026 Implementation
              </h2>
              <div className="space-y-4">
                {niceToHavePolicies.map((policy) => (
                  <div
                    key={policy.policyName}
                    className="bg-white rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{policy.policyName}</h3>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                            {policy.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{policy.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-3xl font-bold text-green-600">{policy.plansAffected}</p>
                        <p className="text-xs text-gray-600">plans affected</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Priority</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getPriorityColor(policy.priority)}`}>
                          {policy.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Gaps Addressed</p>
                        <p className="text-lg font-bold text-gray-900">{policy.gapsAddressed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Risk Mitigated</p>
                        <p className="text-lg font-bold text-green-600">{policy.riskMitigated}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Implementation</p>
                        <p className={`text-lg font-bold ${getComplexityColor(policy.implementationComplexity)}`}>
                          {policy.implementationComplexity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Click to view affected plans →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Policy Detail Modal */}
        {selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPolicy.policyName}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedPolicy.policyArea}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPolicy(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-700">{selectedPolicy.description}</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Affected Plans ({selectedPolicy.plansAffected})
                </h3>
                {selectedPolicy.affectedPlans.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPolicy.affectedPlans.map((planName, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{planName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    This policy addresses {selectedPolicy.gapsAddressed} gaps across {selectedPolicy.plansAffected} compensation plans.
                  </p>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">Implementation Notes</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Priority: <span className="font-bold">{selectedPolicy.priority}</span></li>
                    <li>• Risk Mitigated: <span className="font-bold">{selectedPolicy.riskMitigated}</span></li>
                    <li>• Implementation Complexity: <span className="font-bold">{selectedPolicy.implementationComplexity}</span></li>
                    <li>• Status: <span className="font-bold">{selectedPolicy.status}</span> (requires legal review before deployment)</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Implementation Roadmap */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">2026 Implementation Roadmap</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border-2 border-red-200">
              <p className="text-sm font-bold text-red-600 mb-2">Q1 2026 - MUST HAVE</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {mustHavePolicies.map((p) => (
                  <li key={p.policyName}>• {p.policyName}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
              <p className="text-sm font-bold text-yellow-600 mb-2">Q2 2026 - SHOULD HAVE</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {shouldHavePolicies.map((p) => (
                  <li key={p.policyName}>• {p.policyName}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm font-bold text-green-600 mb-2">Q3 2026 - NICE TO HAVE</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {niceToHavePolicies.map((p) => (
                  <li key={p.policyName}>• {p.policyName}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
