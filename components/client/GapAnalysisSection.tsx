'use client';

import React, { useState } from 'react';
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';

interface Gap {
  id: string;
  planCode: string;
  policyArea: string;
  gapDescription: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'PLANNED' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX';
  bhgPolicyRef?: string;
  assignedTo?: string;
  dueDate?: string;
}

interface GapAnalysisSectionProps {
  gaps: Gap[];
}

/**
 * Gap Analysis Section Component
 * Display gaps with filtering and status indicators
 */
export function GapAnalysisSection({ gaps }: GapAnalysisSectionProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter gaps
  const filteredGaps = gaps.filter((gap) => {
    const matchesSeverity = severityFilter === 'ALL' || gap.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || gap.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-red-700 bg-red-50';
      case 'PLANNED':
        return 'text-blue-700 bg-blue-50';
      case 'IN_PROGRESS':
        return 'text-yellow-700 bg-yellow-50';
      case 'RESOLVED':
        return 'text-green-700 bg-green-50';
      case 'WONT_FIX':
        return 'text-gray-700 bg-gray-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gap Analysis</h2>
        <span className="text-sm text-gray-600">
          {filteredGaps.length} of {gaps.length} gaps
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Severity Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
            Severity
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WONT_FIX">Won't Fix</option>
          </select>
        </div>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {filteredGaps.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircledIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No gaps found with current filters</p>
          </div>
        ) : (
          filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className={`border-2 rounded-lg p-4 ${getSeverityColor(gap.severity)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{gap.policyArea}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Plan: {gap.planCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded uppercase">
                    {gap.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(gap.status)}`}>
                    {gap.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-3 pl-8">{gap.gapDescription}</p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-600 pl-8">
                {gap.bhgPolicyRef && (
                  <span>
                    <strong>BHG Policy:</strong> {gap.bhgPolicyRef}
                  </span>
                )}
                {gap.assignedTo && (
                  <span>
                    <strong>Assigned:</strong> {gap.assignedTo}
                  </span>
                )}
                {gap.dueDate && (
                  <span>
                    <strong>Due:</strong> {new Date(gap.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
