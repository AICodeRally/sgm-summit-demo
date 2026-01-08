'use client';

import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { PlanSection } from '@/lib/contracts/plan-section.contract';

interface SectionNavigatorProps {
  sections: PlanSection[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  planCompletion: number;
}

export default function SectionNavigator({
  sections,
  selectedSectionId,
  onSectionSelect,
  planCompletion,
}: SectionNavigatorProps) {
  const getStatusIcon = (section: PlanSection) => {
    if (section.completionStatus === 'COMPLETED') {
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    } else if (section.completionStatus === 'IN_PROGRESS') {
      return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    } else {
      return <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (section: PlanSection) => {
    if (section.completionStatus === 'COMPLETED') {
      return 'border-green-500 bg-green-50';
    } else if (section.completionStatus === 'IN_PROGRESS') {
      return 'border-yellow-500 bg-yellow-50';
    } else {
      return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Sections</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium text-purple-600">{planCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 h-2 rounded-full transition-all"
              style={{ width: `${planCompletion}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              {sections.filter(s => s.completionStatus === 'COMPLETED').length} Complete
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
              {sections.filter(s => s.completionStatus === 'IN_PROGRESS').length} In Progress
            </div>
            <div className="flex items-center gap-1">
              <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />
              {sections.filter(s => s.completionStatus === 'NOT_STARTED').length} Not Started
            </div>
          </div>
        </div>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedSectionId === section.id
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : getStatusColor(section)
            } hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-none mt-0.5">
                {getStatusIcon(section)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {index + 1}
                  </span>
                  {section.isRequired && (
                    <span className="text-xs font-medium text-red-600">*</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {section.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {section.completionPercentage !== undefined && (
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-purple-600 h-1 rounded-full transition-all"
                          style={{ width: `${section.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    {section.completionPercentage || 0}%
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-200 bg-white">
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-red-600">*</span>
            <span>Required sections</span>
          </div>
          <p>Complete all required sections before submitting</p>
        </div>
      </div>
    </div>
  );
}
