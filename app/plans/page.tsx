'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  EyeOpenIcon,
  Pencil2Icon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import PlanCreationWizard from '@/components/plans/PlanCreationWizard';
import type { Plan } from '@/lib/contracts/plan.contract';

type PlanStatus = 'DRAFT' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED' | 'ARCHIVED';
type PlanType = 'COMPENSATION_PLAN' | 'GOVERNANCE_PLAN' | 'POLICY_CREATION_PLAN';

interface PlanFilters {
  search: string;
  planType: PlanType | 'ALL';
  status: PlanStatus | 'ALL';
}

const statusColors: Record<PlanStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  PUBLISHED: 'bg-purple-100 text-purple-800',
  SUPERSEDED: 'bg-gray-100 text-gray-600',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const planTypeLabels: Record<PlanType, string> = {
  COMPENSATION_PLAN: 'Compensation Plan',
  GOVERNANCE_PLAN: 'Governance Plan',
  POLICY_CREATION_PLAN: 'Policy Plan',
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [filters, setFilters] = useState<PlanFilters>({
    search: '',
    planType: 'ALL',
    status: 'ALL',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [filters]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.planType !== 'ALL') params.append('planType', filters.planType);
      if (filters.status !== 'ALL') params.append('status', filters.status);

      const response = await fetch(`/api/plans?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch plans');

      const data = await response.json();
      let filtered = data.plans || [];

      // Client-side search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter((p: Plan) =>
          p.title.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.planCode.toLowerCase().includes(search)
        );
      }

      setPlans(filtered);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SetPageTitle
        title="Governance Plans"
        description="Plan templates and governance implementation tracking"
      />
      <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-8 py-6">
          <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-white border-purple-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MixerHorizontalIcon className="h-5 w-5" />
              Filters
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              New Plan
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-2xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans by title, code, or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Type
                </label>
                <select
                  value={filters.planType}
                  onChange={(e) => setFilters({ ...filters, planType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="COMPENSATION_PLAN">Compensation Plans</option>
                  <option value="GOVERNANCE_PLAN">Governance Plans</option>
                  <option value="POLICY_CREATION_PLAN">Policy Plans</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading plans...</div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileTextIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No plans found
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first plan to get started
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all"
            >
              Create Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {/* Creation Wizard */}
      <PlanCreationWizard
        isOpen={showWizard}
        onClose={() => {
          setShowWizard(false);
          fetchPlans();
        }}
      />
      </div>
    </>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {plan.title}
            </h3>
            <p className="text-sm text-gray-500">{plan.planCode}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[plan.status as PlanStatus]}`}>
            {plan.status.replace('_', ' ')}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {plan.description || 'No description provided'}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Type:</span>
            <span className="font-medium">{planTypeLabels[plan.planType as PlanType]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Progress:</span>
            <span className="font-medium">{plan.completionPercentage || 0}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Sections:</span>
            <span className="font-medium">{plan.sectionsCompleted || 0} / {plan.sectionsTotal || 0}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 h-2 rounded-full transition-all"
              style={{ width: `${plan.completionPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/plans/${plan.id}`}
            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Pencil2Icon className="h-4 w-4" />
            Edit
          </Link>
          <Link
            href={`/plans/${plan.id}`}
            className="flex-1 px-3 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <EyeOpenIcon className="h-4 w-4" />
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
