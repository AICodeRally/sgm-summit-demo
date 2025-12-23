'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface PlanCoverage {
  planName: string;
  businessUnit?: string;
  planType?: string;
  legalRisk?: string;
  financialRisk?: string;
  coverageStats: {
    full: number;
    limited: number;
    no: number;
    total: number;
    percentage: number;
  };
  policyCoverage: Record<string, { coverage: string; details: string }>;
}

export default function HenryScheinPlans() {
  const [plans, setPlans] = useState<PlanCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanCoverage | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'coverage'>('coverage');

  useEffect(() => {
    fetch('/api/henryschein/plans')
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans || []);
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSortedPlans = () => {
    const sorted = [...plans];
    if (sortBy === 'coverage') {
      sorted.sort((a, b) => a.coverageStats.percentage - b.coverageStats.percentage);
    } else {
      sorted.sort((a, b) => a.planName.localeCompare(b.planName));
    }
    return sorted;
  };

  const getCoverageColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBg = (pct: number) => {
    if (pct >= 80) return 'bg-green-50 border-green-200';
    if (pct >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading plans...</p>
      </div>
    );
  }

  const sortedPlans = getSortedPlans();

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
                <h1 className="text-2xl font-bold text-gray-900">Plan-by-Plan Analysis</h1>
                <p className="text-sm text-gray-600">{plans.length} compensation plans analyzed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'coverage')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="coverage">Coverage (Low to High)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map((plan) => (
            <div
              key={plan.planName}
              className={`rounded-lg border-2 p-6 cursor-pointer hover:shadow-lg transition-all ${getCoverageBg(
                plan.coverageStats.percentage
              )}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2">{plan.planName}</h3>
                <span
                  className={`text-3xl font-bold ${getCoverageColor(plan.coverageStats.percentage)}`}
                >
                  {plan.coverageStats.percentage.toFixed(0)}%
                </span>
              </div>

              {plan.businessUnit && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Business Unit:</span> {plan.businessUnit}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{plan.coverageStats.full}</p>
                  <p className="text-xs text-gray-600">FULL</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{plan.coverageStats.limited}</p>
                  <p className="text-xs text-gray-600">LIMITED</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{plan.coverageStats.no}</p>
                  <p className="text-xs text-gray-600">NO</p>
                </div>
              </div>

              {(plan.legalRisk || plan.financialRisk) && (
                <div className="pt-3 border-t border-gray-200 space-y-1">
                  {plan.legalRisk && (
                    <p className="text-xs">
                      <span className="font-medium">Legal Risk:</span>{' '}
                      <span
                        className={
                          plan.legalRisk === 'HIGH'
                            ? 'text-red-600 font-bold'
                            : plan.legalRisk === 'MEDIUM'
                            ? 'text-yellow-600 font-bold'
                            : 'text-green-600 font-bold'
                        }
                      >
                        {plan.legalRisk}
                      </span>
                    </p>
                  )}
                  {plan.financialRisk && (
                    <p className="text-xs">
                      <span className="font-medium">Financial Risk:</span>{' '}
                      <span
                        className={
                          plan.financialRisk.includes('HIGH')
                            ? 'text-red-600 font-bold'
                            : 'text-yellow-600 font-bold'
                        }
                      >
                        {plan.financialRisk}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium">
                Click to view details →
              </div>
            </div>
          ))}
        </div>

        {/* Plan Detail Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.planName}</h2>
                    {selectedPlan.businessUnit && (
                      <p className="text-sm text-gray-600 mt-1">{selectedPlan.businessUnit}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Overall Coverage</p>
                    <p
                      className={`text-4xl font-bold ${getCoverageColor(
                        selectedPlan.coverageStats.percentage
                      )}`}
                    >
                      {selectedPlan.coverageStats.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedPlan.coverageStats.full}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Limited</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedPlan.coverageStats.limited}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">No</p>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedPlan.coverageStats.no}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Policy Coverage Details</h3>
                <div className="space-y-3">
                  {Object.entries(selectedPlan.policyCoverage).map(([policy, data]) => (
                    <div
                      key={policy}
                      className={`p-4 rounded-lg border-2 ${
                        data.coverage === 'FULL'
                          ? 'bg-green-50 border-green-200'
                          : data.coverage === 'LIMITED'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{policy}</h4>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${
                            data.coverage === 'FULL'
                              ? 'bg-green-200 text-green-900'
                              : data.coverage === 'LIMITED'
                              ? 'bg-yellow-200 text-yellow-900'
                              : 'bg-red-200 text-red-900'
                          }`}
                        >
                          {data.coverage}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{data.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircledIcon className="w-6 h-6 text-green-600" />
              <h3 className="text-sm font-medium text-gray-700">High Coverage Plans (&gt;80%)</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {plans.filter((p) => p.coverageStats.percentage >= 80).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {((plans.filter((p) => p.coverageStats.percentage >= 80).length / plans.length) * 100).toFixed(0)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              <h3 className="text-sm font-medium text-gray-700">Medium Coverage Plans (60-80%)</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {
                plans.filter(
                  (p) => p.coverageStats.percentage >= 60 && p.coverageStats.percentage < 80
                ).length
              }
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {((plans.filter((p) => p.coverageStats.percentage >= 60 && p.coverageStats.percentage < 80).length / plans.length) * 100).toFixed(0)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CrossCircledIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-sm font-medium text-gray-700">Low Coverage Plans (&lt;60%)</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {plans.filter((p) => p.coverageStats.percentage < 60).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {((plans.filter((p) => p.coverageStats.percentage < 60).length / plans.length) * 100).toFixed(0)}% of total - <span className="font-bold text-red-600">CRITICAL</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
