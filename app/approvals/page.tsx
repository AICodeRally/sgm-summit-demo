'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  PersonIcon,
  FileTextIcon,
  DotFilledIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
  ChatBubbleIcon,
  CalendarIcon,
} from '@radix-ui/react-icons';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { APPROVAL_ITEMS, APPROVAL_STATS, CRB_WINDFALL_DECISIONS, type ApprovalItem } from '@/lib/data/synthetic/governance-approvals.data';

export default function ApprovalsPage() {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCommittee, setFilterCommittee] = useState<string>('all');

  // Filter approvals
  const filteredApprovals = APPROVAL_ITEMS.filter(approval => {
    if (filterStatus !== 'all' && approval.status !== filterStatus) return false;
    if (filterCommittee !== 'all' && approval.committee !== filterCommittee) return false;
    return true;
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-700', icon: ClockIcon },
      IN_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-700', icon: UpdateIcon },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircledIcon },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: CrossCircledIcon },
      NEEDS_INFO: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: ChatBubbleIcon },
    };
    return styles[status] || styles.PENDING;
  };

  // SLA status styling
  const getSLABadge = (slaStatus: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      ON_TIME: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      AT_RISK: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      OVERDUE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };
    return styles[slaStatus] || styles.ON_TIME;
  };

  // Priority badge
  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      LOW: { bg: 'bg-gray-100', text: 'text-gray-600' },
      MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-700' },
      URGENT: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return styles[priority] || styles.MEDIUM;
  };

  // Left Nav - Filters
  const leftNav = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          Quick Stats
        </h2>
        <div className="space-y-2 px-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pending</span>
            <span className="font-semibold text-gray-900">{APPROVAL_STATS.pending}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">In Review</span>
            <span className="font-semibold text-blue-600">{APPROVAL_STATS.inReview}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">At Risk</span>
            <span className="font-semibold text-orange-600">{APPROVAL_STATS.atRisk}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          Status
        </h2>
        <div className="space-y-1">
          {['all', 'PENDING', 'IN_REVIEW', 'NEEDS_INFO', 'APPROVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          Committee
        </h2>
        <div className="space-y-1">
          {['all', 'SGCC', 'CRB'].map(committee => (
            <button
              key={committee}
              onClick={() => setFilterCommittee(committee)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                filterCommittee === committee
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {committee === 'all' ? 'All Committees' : committee}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Center Content - Approval list
  const centerContent = (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-none bg-white/90 backdrop-blur-sm border-b border-purple-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Approval Queue</h1>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{filteredApprovals.length} item{filteredApprovals.length !== 1 ? 's' : ''}</span>
          {filterStatus !== 'all' && <span>• Status: {filterStatus.replace(/_/g, ' ')}</span>}
          {filterCommittee !== 'all' && <span>• Committee: {filterCommittee}</span>}
        </div>
      </div>

      {/* Approval list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {filteredApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <CheckCircledIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No approvals found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          filteredApprovals.map(approval => {
            const statusStyle = getStatusBadge(approval.status);
            const slaStyle = getSLABadge(approval.slaStatus);
            const priorityStyle = getPriorityBadge(approval.priority);

            return (
              <button
                key={approval.id}
                onClick={() => setSelectedApproval(approval)}
                className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${
                  selectedApproval?.id === approval.id ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {approval.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {approval.type} • {approval.committee}
                          {approval.documentCode && ` • ${approval.documentCode}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                          {approval.priority}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {React.createElement(statusStyle.icon, { className: 'w-3 h-3' })}
                          {approval.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {approval.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <PersonIcon className="w-3 h-3" />
                        {approval.requestedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(approval.requestedAt).toLocaleDateString()}
                      </div>
                      {approval.amount && (
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          ${(approval.amount / 1000).toFixed(0)}K
                        </div>
                      )}
                    </div>

                    {/* Progress & SLA */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Step {approval.currentStep + 1} of {approval.totalSteps}</span>
                          <span>{approval.approvers.filter(a => a.status === 'APPROVED').length}/{approval.approvers.length} approved</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${((approval.currentStep + 1) / approval.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${slaStyle.bg} ${slaStyle.text} ${slaStyle.border}`}>
                        <ClockIcon className="w-3 h-3" />
                        {approval.businessDaysRemaining}d
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // Right Detail Pane - Approval details
  const rightDetail = selectedApproval ? (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-purple-200">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Approval Details</h3>
          {selectedApproval.slaStatus === 'AT_RISK' && (
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedApproval.status).bg} ${getStatusBadge(selectedApproval.status).text}`}>
            {selectedApproval.status.replace(/_/g, ' ')}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            {selectedApproval.committee}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Requestor */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Requested By
          </p>
          <div className="flex items-center gap-2">
            <PersonIcon className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-900">{selectedApproval.requestedBy}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(selectedApproval.requestedAt).toLocaleString()}
          </p>
        </div>

        {/* Amount */}
        {selectedApproval.amount && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Amount
            </p>
            <p className="text-lg font-bold text-gray-900">
              ${selectedApproval.amount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Deal Info */}
        {selectedApproval.dealId && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Deal Information
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Deal ID:</span>
                <span className="text-gray-900 font-medium">{selectedApproval.dealId}</span>
              </div>
              {selectedApproval.repName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rep:</span>
                  <span className="text-gray-900 font-medium">{selectedApproval.repName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document */}
        {selectedApproval.documentCode && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Document
            </p>
            <Link
              href={`/documents/${selectedApproval.documentCode}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <FileTextIcon className="w-4 h-4" />
              {selectedApproval.documentCode}
            </Link>
          </div>
        )}

        {/* SLA */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            SLA Status
          </p>
          <div className={`p-3 rounded-lg border ${getSLABadge(selectedApproval.slaStatus).bg} ${getSLABadge(selectedApproval.slaStatus).border}`}>
            <p className={`text-sm font-medium ${getSLABadge(selectedApproval.slaStatus).text}`}>
              {selectedApproval.slaStatus.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {selectedApproval.businessDaysRemaining} business days remaining
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Due: {new Date(selectedApproval.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Approvers */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Approvers ({selectedApproval.approvers.filter(a => a.status === 'APPROVED').length}/{selectedApproval.approvers.length})
          </p>
          <div className="space-y-2">
            {selectedApproval.approvers.map(approver => (
              <div
                key={approver.id}
                className="p-3 bg-white border border-purple-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{approver.name}</p>
                    <p className="text-xs text-gray-500">{approver.role}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    approver.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    approver.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {approver.status === 'APPROVED' && <CheckCircledIcon className="w-3 h-3" />}
                    {approver.status === 'REJECTED' && <CrossCircledIcon className="w-3 h-3" />}
                    {approver.status === 'PENDING' && <ClockIcon className="w-3 h-3" />}
                    {approver.status}
                  </span>
                </div>
                {approver.decidedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(approver.decidedAt).toLocaleString()}
                  </p>
                )}
                {approver.comments && (
                  <p className="text-xs text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                    {approver.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CRB Decision Options */}
        {selectedApproval.type === 'WINDFALL' && selectedApproval.status === 'PENDING' && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              CRB Decision Options
            </p>
            <div className="space-y-2">
              {CRB_WINDFALL_DECISIONS.map((option, idx) => (
                <div key={option.id} className="p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium text-gray-900">{idx + 1}. {option.name}</p>
                  <p className="text-gray-600 mt-0.5">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {selectedApproval.status === 'PENDING' && (
        <div className="flex-none p-4 border-t border-purple-200 space-y-2">
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm">
            Approve
          </button>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm">
            Reject
          </button>
          <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm">
            Request More Info
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="h-full">
      <ThreePaneWorkspace
        leftNav={leftNav}
        centerContent={centerContent}
        rightDetail={rightDetail}
        showRightPane={!!selectedApproval}
      />
    </div>
  );
}
