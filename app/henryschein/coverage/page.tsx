'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, DownloadIcon } from '@radix-ui/react-icons';

interface PlanCoverage {
  planName: string;
  businessUnit?: string;
  coverageStats: {
    full: number;
    limited: number;
    no: number;
    percentage: number;
  };
  policyCoverage: Record<string, { coverage: string; details: string }>;
}

const POLICY_AREAS = [
  'Windfall/Large Deals',
  'Quota Management',
  'Territory Management',
  'Sales Crediting',
  'Clawback/Recovery',
  'SPIF Governance',
  'Termination/Final Pay',
  'New Hire/Onboarding',
  'Leave of Absence',
  'Payment Timing',
  'Compliance (409A, State Wage)',
  'Exceptions/Disputes',
  'Data/Systems/Controls',
  'Draws/Guarantees',
  'Mid-Period Changes',
  'International Requirements',
];

export default function PolicyCoverageMatrix() {
  const [plans, setPlans] = useState<PlanCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{
    plan: string;
    policy: string;
    coverage: string;
    details: string;
  } | null>(null);
  const [filterCoverage, setFilterCoverage] = useState<'ALL' | 'FULL' | 'LIMITED' | 'NO'>('ALL');

  useEffect(() => {
    // Load plan data
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

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'FULL':
        return 'bg-green-500 hover:bg-green-600';
      case 'LIMITED':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'NO':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  const getCoverageText = (coverage: string) => {
    switch (coverage) {
      case 'FULL':
        return 'F';
      case 'LIMITED':
        return 'L';
      case 'NO':
        return 'N';
      default:
        return '?';
    }
  };

  const handleCellClick = (plan: PlanCoverage, policyArea: string) => {
    const coverage = plan.policyCoverage[policyArea];
    if (coverage) {
      setSelectedCell({
        plan: plan.planName,
        policy: policyArea,
        coverage: coverage.coverage,
        details: coverage.details,
      });
    }
  };

  const getFilteredPlans = () => {
    if (filterCoverage === 'ALL') return plans;

    return plans.filter((plan) => {
      const hasCoverage = Object.values(plan.policyCoverage).some(
        (pc) => pc.coverage === filterCoverage
      );
      return hasCoverage;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading policy coverage matrix...</p>
      </div>
    );
  }

  const filteredPlans = getFilteredPlans();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4">
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
                <h1 className="text-2xl font-bold text-gray-900">Policy Coverage Matrix</h1>
                <p className="text-sm text-gray-600">
                  {filteredPlans.length} plans × {POLICY_AREAS.length} policy areas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-6">
        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by coverage:</span>
            <div className="flex gap-2">
              {(['ALL', 'FULL', 'LIMITED', 'NO'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterCoverage(filter)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    filterCoverage === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">FULL (F)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">LIMITED (L)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-600">NO (N)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-[72px] z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 sticky left-0 z-20 min-w-[250px]">
                    Plan Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                    Coverage %
                  </th>
                  {POLICY_AREAS.map((area) => (
                    <th
                      key={area}
                      className="px-2 py-3 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider min-w-[50px]"
                      title={area}
                    >
                      <div className="transform -rotate-45 origin-center whitespace-nowrap">
                        {area.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlans.map((plan, planIdx) => (
                  <tr
                    key={plan.planName}
                    className={planIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      {plan.planName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          plan.coverageStats.percentage >= 80
                            ? 'bg-green-100 text-green-800'
                            : plan.coverageStats.percentage >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {plan.coverageStats.percentage.toFixed(0)}%
                      </span>
                    </td>
                    {POLICY_AREAS.map((policyArea) => {
                      const coverage = plan.policyCoverage[policyArea];
                      const coverageValue = coverage?.coverage || 'NO';

                      return (
                        <td
                          key={policyArea}
                          className="px-2 py-3 text-center cursor-pointer"
                          onClick={() => handleCellClick(plan, policyArea)}
                        >
                          <div
                            className={`w-8 h-8 mx-auto rounded flex items-center justify-center text-white text-xs font-bold transition-all ${getCoverageColor(
                              coverageValue
                            )}`}
                            title={`${plan.planName} - ${policyArea}: ${coverageValue}`}
                          >
                            {getCoverageText(coverageValue)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        {selectedCell && (
          <div className="mt-6 bg-white rounded-lg border-2 border-purple-300 shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedCell.plan}</h3>
                <p className="text-sm text-gray-600">{selectedCell.policy}</p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <span
                className={`px-3 py-1 text-sm font-bold rounded ${
                  selectedCell.coverage === 'FULL'
                    ? 'bg-green-100 text-green-800'
                    : selectedCell.coverage === 'LIMITED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedCell.coverage} COVERAGE
              </span>
            </div>
            <div className="bg-gray-50 rounded p-4">
              <p className="text-sm text-gray-700">{selectedCell.details}</p>
            </div>
            {selectedCell.coverage !== 'FULL' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-900">📋 Recommended Action:</p>
                <p className="text-sm text-blue-800 mt-2">
                  {selectedCell.coverage === 'NO'
                    ? `Add policy language for ${selectedCell.policy} to ${selectedCell.plan}. Check BHG DRAFT policies for templates.`
                    : `Enhance ${selectedCell.policy} policy in ${selectedCell.plan} to include detailed thresholds, workflows, and SLAs.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">FULL Coverage Cells</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {plans.reduce(
                (sum, plan) =>
                  sum +
                  Object.values(plan.policyCoverage).filter((pc) => pc.coverage === 'FULL').length,
                0
              )}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900">LIMITED Coverage Cells</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {plans.reduce(
                (sum, plan) =>
                  sum +
                  Object.values(plan.policyCoverage).filter((pc) => pc.coverage === 'LIMITED')
                    .length,
                0
              )}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900">NO Coverage Cells</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {plans.reduce(
                (sum, plan) =>
                  sum +
                  Object.values(plan.policyCoverage).filter((pc) => pc.coverage === 'NO').length,
                0
              )}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Total Matrix Cells</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {plans.length * POLICY_AREAS.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
