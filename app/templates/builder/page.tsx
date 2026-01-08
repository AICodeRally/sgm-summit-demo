'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckIcon,
  Cross2Icon,
  LockClosedIcon,
  EyeOpenIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  STANDARD_PLAN_TEMPLATE,
  getSectionsByCategory,
  type TemplateSection,
} from '@/lib/data/plan-template-library.data';

type CategoryType = 'PLAN_OVERVIEW' | 'PLAN_MEASURES' | 'PAYOUTS' | 'PAYOUT_EXAMPLE' | 'TERMS_CONDITIONS';

const CATEGORIES: { id: CategoryType; name: string; description: string }[] = [
  {
    id: 'PLAN_OVERVIEW',
    name: '1. Plan Overview',
    description: 'Introduction and summary of compensation plan',
  },
  {
    id: 'PLAN_MEASURES',
    name: '2. Plan Measures',
    description: 'Compensation components (quotas, bonuses, SPIFs)',
  },
  {
    id: 'PAYOUTS',
    name: '3. Payouts',
    description: 'Payment timing and schedule',
  },
  {
    id: 'PAYOUT_EXAMPLE',
    name: '4. Payout Example',
    description: 'Worked calculation examples',
  },
  {
    id: 'TERMS_CONDITIONS',
    name: '5. Terms & Conditions',
    description: 'Governance policies and plan administration',
  },
];

export default function TemplateBuilderPage() {
  const router = useRouter();

  // Track which optional sections are selected
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize with all required sections selected
  useMemo(() => {
    const requiredSections = STANDARD_PLAN_TEMPLATE.filter((s) => s.isRequired).map((s) => s.id);
    setSelectedSections(new Set(requiredSections));
  }, []);

  // Keyboard shortcut: Cmd+Enter to create template
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (templateName && !isCreating && !success) {
          handleCreateTemplate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [templateName, isCreating, success]);

  const toggleSection = (sectionId: string, isRequired: boolean) => {
    if (isRequired) return; // Can't deselect required sections

    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelectedSections(newSelected);
  };

  const getSelectedSections = () => {
    return STANDARD_PLAN_TEMPLATE.filter((s) => selectedSections.has(s.id)).sort(
      (a, b) => a.order - b.order
    );
  };

  const stats = useMemo(() => {
    const selected = getSelectedSections();
    const total = STANDARD_PLAN_TEMPLATE.length;
    const required = STANDARD_PLAN_TEMPLATE.filter((s) => s.isRequired).length;
    const optional = STANDARD_PLAN_TEMPLATE.filter((s) => s.isSelectable).length;
    const selectedOptional = selected.filter((s) => s.isSelectable).length;

    return {
      total,
      required,
      optional,
      selected: selected.length,
      selectedOptional,
    };
  }, [selectedSections]);

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/plan-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant-001',
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          planType: 'COMPENSATION_PLAN',
          category: 'Custom',
          tags: ['Custom', 'User Created'],
          version: '1.0.0',
          status: 'DRAFT',
          source: 'USER_CREATED',
          createdBy: 'current-user', // TODO: Get from auth session
          sections: getSelectedSections().map((s) => ({
            sectionKey: s.id,
            title: s.title,
            description: s.description,
            orderIndex: s.order,
            level: 0,
            isRequired: s.isRequired,
            contentTemplate: s.defaultContent,
            aiAgentRoles: [],
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      const data = await response.json();
      console.log('Template created:', data.template);

      // Show success state briefly
      setSuccess(true);

      // Redirect to templates list after 1.5 seconds
      setTimeout(() => {
        router.push('/templates');
      }, 1500);
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to create template');
      setIsCreating(false);
    }
  };

  return (
    <>
      <SetPageTitle
        title="Template Builder"
        description="Create custom compensation plan templates"
      />

      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/templates"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Templates
                </Link>
                <div className="h-6 w-px bg-purple-300"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                    Compensation Plan Template Builder
                  </h1>
                  <p className="text-sm text-gray-600">
                    Select sections to include in your custom template
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-purple-600">{stats.selected}</span> of{' '}
                    {stats.total} sections selected
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.required} required • {stats.selectedOptional} of {stats.optional} optional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-[1800px] mx-auto px-6 py-6 h-full">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Left Pane: Section Selection */}
              <div className="bg-white rounded-xl border border-purple-200 shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-purple-200 bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Template Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Sales Rep - Medical Division"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Brief description of this template's purpose..."
                        rows={2}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Sections</h2>

                  {CATEGORIES.map((category) => {
                    const sections = getSectionsByCategory(category.id);
                    const selectedInCategory = sections.filter((s) =>
                      selectedSections.has(s.id)
                    ).length;

                    return (
                      <div key={category.id} className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                            <p className="text-xs text-gray-600">{category.description}</p>
                          </div>
                          <span className="text-sm text-gray-600">
                            {selectedInCategory} / {sections.length}
                          </span>
                        </div>

                        <div className="space-y-2 ml-4">
                          {sections.map((section) => {
                            const isSelected = selectedSections.has(section.id);
                            const isRequired = section.isRequired;
                            const isSelectable = section.isSelectable;

                            return (
                              <div
                                key={section.id}
                                className={`border rounded-lg p-3 transition-all ${
                                  isSelected
                                    ? 'border-purple-300 bg-purple-50'
                                    : 'border-gray-200 bg-white'
                                } ${
                                  !isRequired && isSelectable
                                    ? 'cursor-pointer hover:border-purple-300 hover:bg-purple-50/50'
                                    : ''
                                }`}
                                onClick={() => toggleSection(section.id, isRequired)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-none mt-0.5">
                                    {isRequired ? (
                                      <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center">
                                        <LockClosedIcon className="w-3 h-3 text-white" />
                                      </div>
                                    ) : (
                                      <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                          isSelected
                                            ? 'border-purple-600 bg-purple-600'
                                            : 'border-gray-300 bg-white'
                                        }`}
                                      >
                                        {isSelected && (
                                          <CheckIcon className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-mono text-gray-500">
                                        {section.sectionNumber}
                                      </span>
                                      <h4 className="text-sm font-semibold text-gray-900">
                                        {section.title}
                                      </h4>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {section.description}
                                    </p>
                                    {isRequired && (
                                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                        REQUIRED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Live Preview */}
              <div className="bg-white rounded-xl border border-purple-200 shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-purple-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOpenIcon className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Template Preview</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    This is how your template structure will look
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* Template Header */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg border-2 border-purple-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {templateName || '[Template Name]'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {templateDescription || '[Template description will appear here]'}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-purple-600">{stats.selected}</span>{' '}
                        <span className="text-gray-600">Total Sections</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <div>
                        <span className="font-semibold text-green-600">{stats.required}</span>{' '}
                        <span className="text-gray-600">Required</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <div>
                        <span className="font-semibold text-blue-600">
                          {stats.selectedOptional}
                        </span>{' '}
                        <span className="text-gray-600">Optional</span>
                      </div>
                    </div>
                  </div>

                  {/* Table of Contents */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h3>
                    <div className="space-y-1">
                      {CATEGORIES.map((category) => {
                        const sectionsInCategory = getSelectedSections().filter(
                          (s) => s.category === category.id
                        );

                        if (sectionsInCategory.length === 0) return null;

                        return (
                          <div key={category.id} className="mb-4">
                            <div className="font-bold text-sm text-purple-700 mb-2 pb-1 border-b border-purple-200">
                              {category.name}
                            </div>
                            {sectionsInCategory.map((section) => (
                              <div
                                key={section.id}
                                className="flex items-center gap-3 py-1.5 px-2 hover:bg-white rounded transition-colors"
                              >
                                <span className="text-xs font-mono text-gray-500 w-12">
                                  {section.sectionNumber}
                                </span>
                                <span className="text-sm text-gray-700 flex-1">
                                  {section.title}
                                </span>
                                {section.isRequired && (
                                  <LockClosedIcon className="w-3 h-3 text-purple-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Empty State */}
                  {stats.selected === 0 && (
                    <div className="text-center py-12">
                      <Cross2Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No sections selected yet</p>
                      <p className="text-sm text-gray-400">
                        Select sections from the left panel to preview your template
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-purple-200 bg-gray-50">
                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircledIcon className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        Template created successfully! Redirecting...
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{stats.selected} sections</span> ready to
                      use
                      <span className="ml-3 text-xs text-gray-400">
                        • Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">⌘</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to create
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={isCreating || success}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save as Draft
                      </button>
                      <button
                        onClick={handleCreateTemplate}
                        disabled={!templateName || isCreating || success}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : success ? (
                          <>
                            <CheckCircledIcon className="w-5 h-5" />
                            Created!
                          </>
                        ) : (
                          'Create Template'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
