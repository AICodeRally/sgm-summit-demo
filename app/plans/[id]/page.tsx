'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  FileTextIcon,
  CalendarIcon,
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  Pencil1Icon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface Plan {
  id: string;
  planCode: string;
  title: string;
  description?: string;
  planType: string;
  version: string;
  status: string;
  owner: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  effectiveDate?: string;
  expirationDate?: string;
  completionPercentage: number;
  sectionsCompleted: number;
  sectionsTotal: number;
  metadata?: Record<string, any>;
}

interface PlanSection {
  id: string;
  sectionKey: string;
  title: string;
  description?: string;
  orderIndex: number;
  level: number;
  isRequired: boolean;
  content: string;
  completionStatus: string;
  completionPercentage: number;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PENDING_APPROVAL: 'bg-orange-100 text-orange-800 border-orange-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  PUBLISHED: 'bg-purple-100 text-purple-800 border-purple-300',
  ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const completionStatusColors: Record<string, string> = {
  NOT_STARTED: 'text-gray-400',
  IN_PROGRESS: 'text-blue-500',
  COMPLETED: 'text-green-500',
  UNDER_REVIEW: 'text-yellow-500',
  APPROVED: 'text-purple-500',
};

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [sections, setSections] = useState<PlanSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const fetchPlanDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const planResponse = await fetch(`/api/plans/${planId}`);
      if (!planResponse.ok) {
        throw new Error('Plan not found');
      }
      const planData = await planResponse.json();
      setPlan(planData.plan);

      const sectionsResponse = await fetch(`/api/plans/${planId}/sections`);
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData.sections || []);
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Cross2Icon className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested plan could not be found.'}</p>
          <Link
            href="/plans"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SetPageTitle title={plan.title} description={'Plan ' + plan.planCode} />

      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col overflow-hidden">
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/plans"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Plans
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {/* Edit Plan button - Coming soon
                <Link
                  href={`/plans/${planId}/edit`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Pencil1Icon className="w-4 h-4" />
                  Edit Plan
                </Link>
                */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {plan.title}
                    </h1>
                    <span className={'px-3 py-1 rounded-full text-xs font-semibold border ' + (statusColors[plan.status] || statusColors.DRAFT)}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Plan Code: <span className="font-mono font-medium text-gray-700">{plan.planCode}</span>
                    {' • '}
                    Version: <span className="font-medium text-gray-700">{plan.version}</span>
                  </p>
                  {plan.description && (
                    <p className="text-gray-700 leading-relaxed">{plan.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <PersonIcon className="w-4 h-4" />
                    Owner
                  </div>
                  <p className="font-medium text-gray-900">{plan.owner}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    Effective Date
                  </div>
                  <p className="font-medium text-gray-900">{formatDate(plan.effectiveDate)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    Expiration Date
                  </div>
                  <p className="font-medium text-gray-900">{formatDate(plan.expirationDate)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <CheckCircledIcon className="w-4 h-4" />
                    Completion
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all"
                        style={{ width: plan.completionPercentage + '%' }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{plan.completionPercentage}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {plan.sectionsCompleted} of {plan.sectionsTotal} sections
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-purple-600" />
                Plan Sections
              </h2>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No sections found in this plan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                      style={{ marginLeft: (section.level * 20) + 'px' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                            {section.isRequired && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Required
                              </span>
                            )}
                            <span className={'flex items-center gap-1 text-xs font-medium ' + (completionStatusColors[section.completionStatus] || 'text-gray-400')}>
                              <CheckCircledIcon className="w-3 h-3" />
                              {section.completionStatus.replace('_', ' ')}
                            </span>
                          </div>
                          {section.description && (
                            <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                          )}
                          {section.content && section.content.trim() && (
                            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
