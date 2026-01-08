'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  TableIcon,
  FileTextIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  LayersIcon,
  AvatarIcon,
  CalendarIcon,
  DotFilledIcon,
  DoubleArrowUpIcon,
  ArrowUpIcon,
  DashIcon,
  Link2Icon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import {
  GOVERNANCE_MATRIX,
  MATRIX_STATS,
  POLICY_AREAS,
  AUTHORITY_INFO,
  MatrixEntry,
} from '@/lib/data/synthetic/governance-matrix.data';

export default function GovernanceMatrixPage() {
  const [selectedEntry, setSelectedEntry] = useState<MatrixEntry | null>(null);
  const [filterPolicyArea, setFilterPolicyArea] = useState<string>('all');
  const [filterAuthority, setFilterAuthority] = useState<string>('all');
  const [filterCoverage, setFilterCoverage] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter matrix entries
  const filteredEntries = GOVERNANCE_MATRIX.filter(e => {
    if (filterPolicyArea !== 'all' && e.policyArea !== filterPolicyArea) return false;
    if (filterAuthority !== 'all' && e.approvalAuthority !== filterAuthority) return false;
    if (filterCoverage !== 'all' && e.coverage !== filterCoverage) return false;
    if (filterRisk !== 'all' && e.riskLevel !== filterRisk) return false;
    if (searchQuery &&
        !e.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.documentCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.policyArea.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get coverage icon
  const getCoverageIcon = (coverage: MatrixEntry['coverage']) => {
    switch (coverage) {
      case 'FULL':
        return CheckCircledIcon;
      case 'PARTIAL':
        return ExclamationTriangleIcon;
      case 'GAP':
        return CrossCircledIcon;
      default:
        return DotFilledIcon;
    }
  };

  // Get coverage color
  const getCoverageColor = (coverage: MatrixEntry['coverage']) => {
    switch (coverage) {
      case 'FULL':
        return 'bg-green-100 text-green-700';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-700';
      case 'GAP':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get risk icon
  const getRiskIcon = (risk: MatrixEntry['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL':
        return DoubleArrowUpIcon;
      case 'HIGH':
        return ArrowUpIcon;
      case 'MEDIUM':
        return DashIcon;
      case 'LOW':
        return DashIcon;
      default:
        return DashIcon;
    }
  };

  // Get risk color
  const getRiskColor = (risk: MatrixEntry['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get authority color
  const getAuthorityColor = (authority: MatrixEntry['approvalAuthority']) => {
    switch (authority) {
      case 'SGCC':
        return 'bg-purple-100 text-purple-700';
      case 'CRB':
        return 'bg-pink-100 text-pink-700';
      case 'VP_COMP':
        return 'bg-blue-100 text-blue-700';
      case 'MANAGER':
        return 'bg-gray-100 text-gray-700';
      case 'AUTO':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format authority name
  const formatAuthority = (authority: MatrixEntry['approvalAuthority']) => {
    return authority.replace(/_/g, ' ');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Left Navigation - Stats and Filters
  const leftNav = (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Coverage Stats
        </h2>
        <div className="space-y-2">
          <div className="bg-teal-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-700 font-medium">Total Policies</span>
              <span className="text-lg font-bold text-teal-700">{MATRIX_STATS.totalPolicies}</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">Full Coverage</span>
              <span className="text-lg font-bold text-green-700">{MATRIX_STATS.fullCoverage}</span>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-700 font-medium">Partial</span>
              <span className="text-lg font-bold text-yellow-700">{MATRIX_STATS.partialCoverage}</span>
            </div>
          </div>
          <div className="bg-red-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-700 font-medium">Gaps</span>
              <span className="text-lg font-bold text-red-700">{MATRIX_STATS.gaps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Filter */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Coverage
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterCoverage('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'all'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Coverage
          </button>
          <button
            onClick={() => setFilterCoverage('FULL')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'FULL'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CheckCircledIcon className="w-4 h-4 text-green-600" />
            Full ({MATRIX_STATS.fullCoverage})
          </button>
          <button
            onClick={() => setFilterCoverage('PARTIAL')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'PARTIAL'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
            Partial ({MATRIX_STATS.partialCoverage})
          </button>
          <button
            onClick={() => setFilterCoverage('GAP')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'GAP'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CrossCircledIcon className="w-4 h-4 text-red-600" />
            Gaps ({MATRIX_STATS.gaps})
          </button>
        </div>
      </div>

      {/* Authority Filter */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Authority
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterAuthority('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterAuthority === 'all'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AvatarIcon className="w-4 h-4" />
            All Authorities
          </button>
          {Object.entries(MATRIX_STATS.byAuthority).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilterAuthority(key)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                filterAuthority === key
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AvatarIcon className="w-4 h-4" />
              {formatAuthority(key as MatrixEntry['approvalAuthority'])} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Policy Area Filter */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Policy Area
        </h2>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          <button
            onClick={() => setFilterPolicyArea('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterPolicyArea === 'all'
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Areas
          </button>
          {POLICY_AREAS.map(area => {
            const count = MATRIX_STATS.byPolicyArea[area] || 0;
            return (
              <button
                key={area}
                onClick={() => setFilterPolicyArea(area)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  filterPolicyArea === area
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {area} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Center Content - Matrix Table
  const centerContent = (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-none bg-white/90 backdrop-blur-sm border-b border-purple-200 p-6">
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2">
            <TableIcon className="w-4 h-4" />
            Export Matrix
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by policy title, code, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-md border border-purple-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Authority
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SLA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No policies found
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const CoverageIcon = getCoverageIcon(entry.coverage);
                  const RiskIcon = getRiskIcon(entry.riskLevel);

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id ? 'bg-teal-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.documentTitle}
                            </p>
                            <p className="text-xs text-gray-500">{entry.documentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{entry.policyArea}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCoverageColor(entry.coverage)}`}>
                          {React.createElement(CoverageIcon, { className: 'w-3 h-3' })}
                          {entry.coverage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getAuthorityColor(entry.approvalAuthority)}`}>
                          {formatAuthority(entry.approvalAuthority)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {React.createElement(RiskIcon, {
                          className: `w-5 h-5 mx-auto ${getRiskColor(entry.riskLevel)}`
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{entry.sla || 'N/A'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Right Detail Pane - Entry Details
  const rightDetail = selectedEntry ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-purple-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                {selectedEntry.documentCode}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedEntry.policyArea}
              </p>
            </div>
          </div>
          {React.createElement(getRiskIcon(selectedEntry.riskLevel), {
            className: `w-5 h-5 ${getRiskColor(selectedEntry.riskLevel)}`
          })}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2">
          {selectedEntry.documentTitle}
        </h3>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCoverageColor(selectedEntry.coverage)}`}>
            {React.createElement(getCoverageIcon(selectedEntry.coverage), { className: 'w-3 h-3' })}
            {selectedEntry.coverage} Coverage
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getAuthorityColor(selectedEntry.approvalAuthority)}`}>
            {formatAuthority(selectedEntry.approvalAuthority)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Policy Details */}
        <div className="bg-gray-50 rounded-md p-3 space-y-2">
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Owner</span>
            <span className="text-gray-900 font-medium text-right">
              {selectedEntry.owner}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Approval Threshold</span>
            <span className="text-gray-900 font-medium text-right max-w-[60%]">
              {selectedEntry.approvalThreshold || 'N/A'}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">SLA</span>
            <span className="text-gray-900 font-medium">
              {selectedEntry.sla || 'N/A'}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Risk Level</span>
            <span className={`font-medium ${getRiskColor(selectedEntry.riskLevel)}`}>
              {selectedEntry.riskLevel}
            </span>
          </div>
        </div>

        {/* Compensation Artifacts */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Compensation Artifacts
          </h4>
          <div className="space-y-1">
            {selectedEntry.compArtifacts.map((artifact, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded text-sm"
              >
                <DotFilledIcon className="w-3 h-3 text-blue-600" />
                <span className="text-blue-900">{artifact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Dates */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Review Schedule
          </h4>
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Last Reviewed
              </span>
              <span className="text-gray-900 font-medium">
                {formatDate(selectedEntry.lastReviewed)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Next Review
              </span>
              <span className="text-gray-900 font-medium">
                {formatDate(selectedEntry.nextReview)}
              </span>
            </div>
          </div>
        </div>

        {/* Related Documents */}
        {selectedEntry.relatedDocuments && selectedEntry.relatedDocuments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Related Documents ({selectedEntry.relatedDocuments.length})
            </h4>
            <div className="space-y-1">
              {selectedEntry.relatedDocuments.map((docCode, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <Link2Icon className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-blue-600 hover:underline">{docCode}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-none p-4 border-t border-purple-200 space-y-2">
        <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors">
          View Policy Document
        </button>
        <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
          View Coverage Details
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Governance Matrix"
        description="Policy coverage, approval authorities, and compliance mapping"
      />
      <ThreePaneWorkspace
        leftNav={leftNav}
        centerContent={centerContent}
        rightDetail={rightDetail}
        showRightPane={!!selectedEntry}
      />
    </>
  );
}
