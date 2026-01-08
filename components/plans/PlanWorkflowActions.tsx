'use client';

import { useState } from 'react';
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import type { Plan } from '@/lib/contracts/plan.contract';

interface PlanWorkflowActionsProps {
  plan: Plan;
  onActionComplete?: (updatedPlan: Plan) => void;
}

export default function PlanWorkflowActions({
  plan,
  onActionComplete,
}: PlanWorkflowActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLifecycleAction = async (action: string, additionalData?: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/plans/${plan.id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...additionalData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process action');
      }

      const data = await response.json();
      setSuccess(data.message);

      if (onActionComplete && data.plan) {
        onActionComplete(data.plan);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/plans/${plan.id}/generate-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'PDF',
          includeMetadata: true,
          generatedBy: 'current-user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate document');
      }

      const data = await response.json();
      setSuccess(`Document generated: ${data.documentId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (plan.status) {
      case 'DRAFT':
      case 'IN_PROGRESS':
        actions.push({
          label: 'Submit for Review',
          action: 'submit-for-review',
          icon: PaperAirplaneIcon,
          data: { submittedBy: 'current-user' },
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
        });
        break;

      case 'UNDER_REVIEW':
        actions.push({
          label: 'Submit for Approval',
          action: 'submit-for-approval',
          icon: PaperAirplaneIcon,
          data: { submittedBy: 'current-user' },
          className: 'bg-green-600 hover:bg-green-700 text-white',
        });
        actions.push({
          label: 'Reject',
          action: 'reject',
          icon: XCircleIcon,
          data: { rejectedBy: 'current-user', reason: 'Needs revision' },
          className: 'bg-red-600 hover:bg-red-700 text-white',
        });
        break;

      case 'PENDING_APPROVAL':
        actions.push({
          label: 'Approve',
          action: 'approve',
          icon: CheckCircleIcon,
          data: { approvedBy: 'current-user' },
          className: 'bg-green-600 hover:bg-green-700 text-white',
        });
        actions.push({
          label: 'Reject',
          action: 'reject',
          icon: XCircleIcon,
          data: { rejectedBy: 'current-user', reason: 'Not approved' },
          className: 'bg-red-600 hover:bg-red-700 text-white',
        });
        break;

      case 'APPROVED':
        actions.push({
          label: 'Publish',
          action: 'publish',
          icon: RocketLaunchIcon,
          data: {
            publishedBy: 'current-user',
            effectiveDate: new Date(),
          },
          className: 'bg-purple-600 hover:bg-purple-700 text-white',
        });
        break;
    }

    // Archive action available for most statuses
    if (!['ARCHIVED', 'PUBLISHED'].includes(plan.status)) {
      actions.push({
        label: 'Archive',
        action: 'archive',
        icon: ArchiveBoxIcon,
        data: { archivedBy: 'current-user' },
        className: 'bg-gray-600 hover:bg-gray-700 text-white',
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-3">
      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Workflow Actions */}
      {availableActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((actionItem) => {
            const Icon = actionItem.icon;
            return (
              <button
                key={actionItem.action}
                onClick={() => handleLifecycleAction(actionItem.action, actionItem.data)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${actionItem.className}`}
              >
                <Icon className="h-5 w-5" />
                {actionItem.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Generate Document Action */}
      {['APPROVED', 'PUBLISHED'].includes(plan.status) && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={handleGenerateDocument}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Generate Document
          </button>
        </div>
      )}
    </div>
  );
}
