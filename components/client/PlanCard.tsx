'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface PlanCardProps {
  planCode: string;
  planName: string;
  planType?: string;
  businessUnit?: string;
  coverageFull: number;
  coverageLimited: number;
  coverageNo: number;
  riskScore: number;
  detailsHref?: string;
}

/**
 * Plan Card Component
 * Display plan summary with coverage metrics and risk score
 */
export function PlanCard({
  planCode,
  planName,
  planType,
  businessUnit,
  coverageFull,
  coverageLimited,
  coverageNo,
  riskScore,
  detailsHref,
}: PlanCardProps) {
  // Calculate total policies
  const totalPolicies = coverageFull + coverageLimited + coverageNo;
  const coveragePercentage = totalPolicies > 0
    ? Math.round(((coverageFull + coverageLimited * 0.5) / totalPolicies) * 100)
    : 0;

  // Determine risk color
  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50 border-red-300';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-300';
    if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-green-600 bg-green-50 border-green-300';
  };

  const riskLabel = (score: number) => {
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 25) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 p-6 transition-all hover:shadow-lg hover:border-indigo-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{planCode}</h3>
            {planType && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                {planType}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{planName}</p>
          {businessUnit && (
            <p className="text-xs text-gray-500 mt-1">{businessUnit}</p>
          )}
        </div>

        {/* Risk Badge */}
        <div className={`px-3 py-1 rounded-lg border-2 ${getRiskColor(riskScore)}`}>
          <p className="text-xs font-semibold">{riskLabel(riskScore)}</p>
          <p className="text-lg font-bold">{riskScore}</p>
        </div>
      </div>

      {/* Coverage Bars */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Policy Coverage</p>
          <p className="text-sm font-bold text-indigo-600">{coveragePercentage}%</p>
        </div>

        {/* Visual coverage bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
          {coverageFull > 0 && (
            <div
              className="bg-green-500 h-full"
              style={{ width: `${(coverageFull / totalPolicies) * 100}%` }}
              title={`Full Coverage: ${coverageFull}`}
            />
          )}
          {coverageLimited > 0 && (
            <div
              className="bg-yellow-500 h-full"
              style={{ width: `${(coverageLimited / totalPolicies) * 100}%` }}
              title={`Limited Coverage: ${coverageLimited}`}
            />
          )}
          {coverageNo > 0 && (
            <div
              className="bg-red-500 h-full"
              style={{ width: `${(coverageNo / totalPolicies) * 100}%` }}
              title={`No Coverage: ${coverageNo}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-600">Full ({coverageFull})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-gray-600">Limited ({coverageLimited})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-gray-600">None ({coverageNo})</span>
          </div>
        </div>
      </div>

      {/* Details Link */}
      {detailsHref && (
        <Link href={detailsHref as any}>
          <div className="flex items-center justify-between text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-semibold">View Details</span>
            <ArrowRightIcon className="w-4 h-4" />
          </div>
        </Link>
      )}
    </div>
  );
}
