'use client';

import React from 'react';
import { ReaderIcon, ArrowRightIcon } from '@radix-ui/react-icons';

interface PolicyRecommendation {
  id: string;
  policyCode: string;
  policyName: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  impactedPlans: string[];
  bhgReference?: string;
}

interface PolicyRecommendationsProps {
  recommendations: PolicyRecommendation[];
}

/**
 * Policy Recommendations Component
 * Display BHG best practice policy suggestions
 */
export function PolicyRecommendations({ recommendations }: PolicyRecommendationsProps) {
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-50 border-red-300';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-50 border-yellow-300';
      case 'LOW':
        return 'text-green-700 bg-green-50 border-green-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  // Sort by priority
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Policy Recommendations</h2>
        <p className="text-sm text-gray-600">
          Best practice policies from BHG governance framework
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <ReaderIcon className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
            <p className="text-gray-600">No policy recommendations at this time</p>
            <p className="text-xs text-gray-500 mt-1">
              All critical policies are in place
            </p>
          </div>
        ) : (
          sortedRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border-2 rounded-lg p-5 ${getPriorityColor(rec.priority)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ReaderIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.policyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-gray-600">{rec.policyCode}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">{rec.category}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                <span className="px-3 py-1 text-xs font-semibold rounded uppercase whitespace-nowrap">
                  {rec.priority}
                </span>
              </div>

              {/* Rationale */}
              <p className="text-sm text-gray-700 mb-3 pl-8">{rec.rationale}</p>

              {/* Impacted Plans */}
              {rec.impactedPlans.length > 0 && (
                <div className="pl-8 mb-3">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Impacted Plans
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rec.impactedPlans.map((planCode) => (
                      <span
                        key={planCode}
                        className="px-2 py-1 bg-white text-gray-700 text-xs font-mono rounded border border-gray-300"
                      >
                        {planCode}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BHG Reference */}
              {rec.bhgReference && (
                <div className="pl-8 flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    <strong>BHG Reference:</strong> {rec.bhgReference}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold">
                    View Policy <ArrowRightIcon className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-indigo-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {recommendations.filter((r) => r.priority === 'CRITICAL').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Critical</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {recommendations.filter((r) => r.priority === 'HIGH').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">High</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {recommendations.filter((r) => r.priority === 'MEDIUM').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Medium</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {recommendations.filter((r) => r.priority === 'LOW').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Low</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
