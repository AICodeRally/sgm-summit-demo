'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  CalendarIcon,
  DotFilledIcon,
  BarChartIcon,
  LayersIcon,
  DoubleArrowUpIcon,
  ArrowUpIcon,
  DashIcon,
} from '@radix-ui/react-icons';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { CASE_ITEMS, CASE_STATS, CASE_TYPE_INFO, CaseItem } from '@/lib/data/synthetic/cases.data';

export default function CasesPage() {
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cases
  const filteredCases = CASE_ITEMS.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Sort by most recent first
  const sortedCases = [...filteredCases].sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Get status icon
  const getStatusIcon = (status: CaseItem['status']) => {
    switch (status) {
      case 'NEW':
        return DotFilledIcon;
      case 'UNDER_REVIEW':
        return ClockIcon;
      case 'PENDING_INFO':
        return ExclamationTriangleIcon;
      case 'ESCALATED':
        return DoubleArrowUpIcon;
      case 'RESOLVED':
        return CheckCircledIcon;
      case 'CLOSED':
        return CrossCircledIcon;
      default:
        return DotFilledIcon;
    }
  };

  // Get status color
  const getStatusColor = (status: CaseItem['status']) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-700';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-700';
      case 'PENDING_INFO':
        return 'bg-orange-100 text-orange-700';
      case 'ESCALATED':
        return 'bg-red-100 text-red-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: CaseItem['priority']) => {
    switch (priority) {
      case 'URGENT':
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

  // Get priority color
  const getPriorityColor = (priority: CaseItem['priority']) => {
    switch (priority) {
      case 'URGENT':
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

  // Get case type icon
  const getCaseTypeIcon = (type: CaseItem['type']) => {
    switch (type) {
      case 'EXCEPTION':
        return ExclamationTriangleIcon;
      case 'DISPUTE':
        return BarChartIcon;
      case 'TERRITORY_CHANGE':
        return LayersIcon;
      case 'QUOTA_ADJUSTMENT':
        return BarChartIcon;
      case 'PLAN_MODIFICATION':
        return FileTextIcon;
      default:
        return FileTextIcon;
    }
  };

  // Format case type name
  const formatCaseType = (type: CaseItem['type']) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Left Navigation - Stats and Filters
  const leftNav = (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Stats
        </h2>
        <div className="space-y-2">
          <div className="bg-pink-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-pink-700 font-medium">Active</span>
              <span className="text-lg font-bold text-pink-700">
                {CASE_STATS.new + CASE_STATS.underReview + CASE_STATS.pendingInfo + CASE_STATS.escalated}
              </span>
            </div>
          </div>
          <div className="bg-green-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">Resolved</span>
              <span className="text-lg font-bold text-green-700">{CASE_STATS.resolved}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Closed</span>
              <span className="text-lg font-bold text-gray-600">{CASE_STATS.closed}</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700 font-medium">Avg Days</span>
              <span className="text-lg font-bold text-blue-700">{CASE_STATS.avgResolutionDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Status
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'all'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Cases
          </button>
          <button
            onClick={() => setFilterStatus('NEW')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'NEW'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DotFilledIcon className="w-4 h-4" />
            New ({CASE_STATS.new})
          </button>
          <button
            onClick={() => setFilterStatus('UNDER_REVIEW')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'UNDER_REVIEW'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Under Review ({CASE_STATS.underReview})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_INFO')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'PENDING_INFO'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Pending Info ({CASE_STATS.pendingInfo})
          </button>
          <button
            onClick={() => setFilterStatus('ESCALATED')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'ESCALATED'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DoubleArrowUpIcon className="w-4 h-4" />
            Escalated ({CASE_STATS.escalated})
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'RESOLVED'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CheckCircledIcon className="w-4 h-4" />
            Resolved ({CASE_STATS.resolved})
          </button>
        </div>
      </div>

      {/* Case Type Filter */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Case Type
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterType('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterType === 'all'
                ? 'bg-pink-50 text-pink-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Types
          </button>
          {Object.entries(CASE_TYPE_INFO).map(([key, info]) => {
            const Icon = getCaseTypeIcon(key as CaseItem['type']);
            const count = CASE_ITEMS.filter(c => c.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  filterType === key
                    ? 'bg-pink-50 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {info.name} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Center Content - Case List
  const centerContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none bg-white/90 backdrop-blur-sm border-b border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
            <p className="text-sm text-gray-600 mt-1">
              Exceptions, disputes, and special requests
            </p>
          </div>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-md text-sm font-medium hover:bg-pink-700 transition-colors flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" />
            New Case
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cases by title or case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Case List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {sortedCases.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No cases found</p>
            </div>
          ) : (
            sortedCases.map((caseItem) => {
              const StatusIcon = getStatusIcon(caseItem.status);
              const PriorityIcon = getPriorityIcon(caseItem.priority);
              const TypeIcon = getCaseTypeIcon(caseItem.type);

              return (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem)}
                  className={`w-full text-left bg-white/80 backdrop-blur-sm rounded-md border transition-all hover:shadow-md ${
                    selectedCase?.id === caseItem.id
                      ? 'border-pink-300 shadow-sm'
                      : 'border-purple-200'
                  }`}
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TypeIcon className="w-5 h-5 text-pink-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {caseItem.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {caseItem.caseNumber}
                          </p>
                        </div>
                      </div>
                      <PriorityIcon className={`w-4 h-4 flex-shrink-0 ml-2 ${getPriorityColor(caseItem.priority)}`} />
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                        {React.createElement(StatusIcon, { className: 'w-3 h-3' })}
                        {caseItem.status.replace(/_/g, ' ')}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {formatCaseType(caseItem.type)}
                      </span>
                      {caseItem.committee && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {caseItem.committee}
                        </span>
                      )}
                      {caseItem.financialImpact && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          ${(caseItem.financialImpact / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <PersonIcon className="w-3 h-3" />
                        {caseItem.affectedRep || caseItem.submittedBy.split(' (')[0]}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {caseItem.businessDaysElapsed} days
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // Right Detail Pane - Case Details
  const rightDetail = selectedCase ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-purple-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {React.createElement(getCaseTypeIcon(selectedCase.type), {
              className: 'w-5 h-5 text-pink-600 flex-shrink-0'
            })}
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                {selectedCase.caseNumber}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatCaseType(selectedCase.type)}
              </p>
            </div>
          </div>
          {React.createElement(getPriorityIcon(selectedCase.priority), {
            className: `w-5 h-5 ${getPriorityColor(selectedCase.priority)}`
          })}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2">
          {selectedCase.title}
        </h3>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
            {React.createElement(getStatusIcon(selectedCase.status), { className: 'w-3 h-3' })}
            {selectedCase.status.replace(/_/g, ' ')}
          </span>
          {selectedCase.committee && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              {selectedCase.committee}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Description
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {selectedCase.description}
          </p>
        </div>

        {/* Key Information */}
        <div className="bg-gray-50 rounded-md p-3 space-y-2">
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Submitted By</span>
            <span className="text-gray-900 font-medium text-right">
              {selectedCase.submittedBy}
            </span>
          </div>
          {selectedCase.affectedRep && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-gray-600">Affected Rep</span>
              <span className="text-gray-900 font-medium">
                {selectedCase.affectedRep}
              </span>
            </div>
          )}
          {selectedCase.assignedTo && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-gray-600">Assigned To</span>
              <span className="text-gray-900 font-medium text-right">
                {selectedCase.assignedTo}
              </span>
            </div>
          )}
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Submitted</span>
            <span className="text-gray-900 font-medium">
              {formatDate(selectedCase.submittedAt)}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Due Date</span>
            <span className="text-gray-900 font-medium">
              {formatDate(selectedCase.resolutionDueDate)}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-gray-600">Days Elapsed</span>
            <span className="text-gray-900 font-medium">
              {selectedCase.businessDaysElapsed} business days
            </span>
          </div>
          {selectedCase.financialImpact !== undefined && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-gray-600">Financial Impact</span>
              <span className="text-gray-900 font-medium">
                ${selectedCase.financialImpact.toLocaleString()}
              </span>
            </div>
          )}
          {selectedCase.relatedDealId && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-gray-600">Related Deal</span>
              <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                {selectedCase.relatedDealId}
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Timeline
          </h4>
          <div className="space-y-3">
            {selectedCase.timeline.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-none">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-1.5"></div>
                  {index < selectedCase.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 ml-0.75 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.action}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{event.actor}</p>
                  {event.notes && (
                    <p className="text-xs text-gray-700 bg-gray-50 rounded p-2 mt-2">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution (if exists) */}
        {selectedCase.resolution && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">
              Resolution
            </h4>
            <div className="space-y-2">
              <div className="flex items-start justify-between text-xs">
                <span className="text-green-700 font-medium">Decision</span>
                <span className="text-green-900 font-semibold">
                  {selectedCase.resolution.decision}
                </span>
              </div>
              <div className="flex items-start justify-between text-xs">
                <span className="text-green-700">Decided By</span>
                <span className="text-green-900">
                  {selectedCase.resolution.decidedBy}
                </span>
              </div>
              <div className="flex items-start justify-between text-xs">
                <span className="text-green-700">Date</span>
                <span className="text-green-900">
                  {formatDate(selectedCase.resolution.decidedAt)}
                </span>
              </div>
              <div className="text-xs text-green-900 mt-3 leading-relaxed">
                <p className="font-medium mb-1">Rationale:</p>
                <p>{selectedCase.resolution.rationale}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attachments */}
        {selectedCase.attachments && selectedCase.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Attachments ({selectedCase.attachments.length})
            </h4>
            <div className="space-y-2">
              {selectedCase.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <FileTextIcon className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {attachment.type} • {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions (for active cases) */}
      {selectedCase.status !== 'RESOLVED' && selectedCase.status !== 'CLOSED' && (
        <div className="flex-none p-4 border-t border-purple-200 space-y-2">
          <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-md text-sm font-medium hover:bg-pink-700 transition-colors">
            Update Case
          </button>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Request Information
          </button>
          {selectedCase.status === 'UNDER_REVIEW' && (
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
              Escalate to {selectedCase.committee || 'Committee'}
            </button>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <ThreePaneWorkspace
      leftNav={leftNav}
      centerContent={centerContent}
      rightDetail={rightDetail}
      showRightPane={!!selectedCase}
    />
  );
}
