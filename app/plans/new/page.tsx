'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  Cross2Icon,
  FileTextIcon,
  PersonIcon,
  CalendarIcon,
  ClockIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

// Wizard steps
type WizardStep = 'template' | 'basics' | 'sections' | 'review';

interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
  planType: string;
  sectionCount: number;
  isSystemTemplate: boolean;
  tags: string[];
}

interface PlanBasics {
  title: string;
  description: string;
  effectiveDate: string;
  expirationDate: string;
  owner: string;
  fiscalYear: string;
}

interface SectionContent {
  sectionId: string;
  title: string;
  content: string;
  isComplete: boolean;
}

export default function NewPlanPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [planBasics, setPlanBasics] = useState<PlanBasics>({
    title: '',
    description: '',
    effectiveDate: '',
    expirationDate: '',
    owner: '',
    fiscalYear: new Date().getFullYear().toString(),
  });
  const [sectionContents, setSectionContents] = useState<SectionContent[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/plan-templates?status=ACTIVE');
      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    // Pre-populate plan title
    setPlanBasics({
      ...planBasics,
      title: `${template.name} - ${planBasics.fiscalYear}`,
    });
  };

  const handleNextStep = () => {
    if (currentStep === 'template' && selectedTemplate) {
      setCurrentStep('basics');
    } else if (currentStep === 'basics') {
      // Initialize sections from template
      // For now, using placeholder sections
      const sections: SectionContent[] = [
        { sectionId: 'section-01', title: 'Plan Overview', content: '', isComplete: false },
        { sectionId: 'section-02', title: 'Plan Summary', content: '', isComplete: false },
        { sectionId: 'section-10', title: 'Plan Measures', content: '', isComplete: false },
      ];
      setSectionContents(sections);
      setCurrentStep('sections');
    } else if (currentStep === 'sections') {
      setCurrentStep('review');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'basics') {
      setCurrentStep('template');
    } else if (currentStep === 'sections') {
      setCurrentStep('basics');
    } else if (currentStep === 'review') {
      setCurrentStep('sections');
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/plans/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          tenantId: 'demo-tenant-001',
          title: planBasics.title,
          description: planBasics.description,
          owner: planBasics.owner || 'current-user',
          createdBy: 'current-user', // TODO: Get from auth
          effectiveDate: planBasics.effectiveDate || undefined,
          expirationDate: planBasics.expirationDate || undefined,
          metadata: {
            fiscalYear: planBasics.fiscalYear,
          },
          sections: sectionContents.map((s) => ({
            sectionKey: s.sectionId,
            title: s.title,
            content: s.content || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }

      const data = await response.json();
      console.log('Plan created:', data.plan);

      // Redirect to the new plan
      router.push(`/plans/${data.plan.id}`);
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to create plan');
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 'template') return !!selectedTemplate;
    if (currentStep === 'basics') return !!planBasics.title.trim();
    if (currentStep === 'sections') return true; // Can skip sections
    return true;
  };

  const getStepProgress = () => {
    const steps: WizardStep[] = ['template', 'basics', 'sections', 'review'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  return (
    <>
      <SetPageTitle
        title="Create New Plan"
        description="Create a compensation plan from a template"
      />

      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/plans"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Cancel
                </Link>
                <div className="h-6 w-px bg-purple-300"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                    Create New Compensation Plan
                  </h1>
                  <p className="text-sm text-gray-600">
                    {currentStep === 'template' && 'Select a template to get started'}
                    {currentStep === 'basics' && 'Enter plan details'}
                    {currentStep === 'sections' && 'Add content to sections'}
                    {currentStep === 'review' && 'Review and create plan'}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-600">
                    Step {['template', 'basics', 'sections', 'review'].indexOf(currentStep) + 1} of 4
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(getStepProgress())}% complete
                  </div>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600 transition-all duration-300"
                    style={{ width: `${getStepProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white border-b border-purple-200">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {[
                { id: 'template', label: 'Template', icon: FileTextIcon },
                { id: 'basics', label: 'Basics', icon: PersonIcon },
                { id: 'sections', label: 'Sections', icon: FileTextIcon },
                { id: 'review', label: 'Review', icon: CheckCircledIcon },
              ].map((step, idx) => {
                const isActive = currentStep === step.id;
                const isCompleted = ['template', 'basics', 'sections', 'review'].indexOf(currentStep) > idx;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : isCompleted
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 bg-white text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircledIcon className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? 'text-purple-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                        <div
                          className={`h-full transition-all ${
                            isCompleted ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
                <Cross2Icon className="w-5 h-5 text-red-600 flex-none" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Step: Template Selection */}
            {currentStep === 'template' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-600 bg-purple-50 shadow-lg'
                          : 'border-purple-200 bg-white hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-xs font-mono text-gray-500">{template.code}</p>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircledIcon className="w-6 h-6 text-purple-600 flex-none" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          {template.planType.replace('_', ' ')}
                        </span>
                        {template.isSystemTemplate && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            SYSTEM
                          </span>
                        )}
                        <span className="text-xs text-gray-600">
                          {template.sectionCount} sections
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {templates.length === 0 && (
                  <div className="text-center py-12">
                    <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No templates available</p>
                    <Link
                      href="/templates/builder"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-semibold"
                    >
                      Create a Template First
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Step: Plan Basics */}
            {currentStep === 'basics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan Details</h2>
                <div className="bg-white rounded-lg border-2 border-purple-200 shadow-lg p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={planBasics.title}
                        onChange={(e) => setPlanBasics({ ...planBasics, title: e.target.value })}
                        placeholder="e.g., Medical FSC Sales Plan - FY2025"
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={planBasics.description}
                        onChange={(e) => setPlanBasics({ ...planBasics, description: e.target.value })}
                        placeholder="Brief description of this plan's purpose and goals..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <CalendarIcon className="inline w-4 h-4 mr-1" />
                          Effective Date
                        </label>
                        <input
                          type="date"
                          value={planBasics.effectiveDate}
                          onChange={(e) => setPlanBasics({ ...planBasics, effectiveDate: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <CalendarIcon className="inline w-4 h-4 mr-1" />
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          value={planBasics.expirationDate}
                          onChange={(e) => setPlanBasics({ ...planBasics, expirationDate: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <PersonIcon className="inline w-4 h-4 mr-1" />
                          Plan Owner
                        </label>
                        <input
                          type="text"
                          value={planBasics.owner}
                          onChange={(e) => setPlanBasics({ ...planBasics, owner: e.target.value })}
                          placeholder="e.g., John Smith"
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <ClockIcon className="inline w-4 h-4 mr-1" />
                          Fiscal Year
                        </label>
                        <input
                          type="text"
                          value={planBasics.fiscalYear}
                          onChange={(e) => setPlanBasics({ ...planBasics, fiscalYear: e.target.value })}
                          placeholder="e.g., 2025"
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Section Content */}
            {currentStep === 'sections' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Section Content</h2>
                <p className="text-gray-600 mb-6">
                  You can add content now or skip and add it later in the plan editor.
                </p>
                <div className="space-y-4">
                  {sectionContents.map((section, idx) => (
                    <div
                      key={section.sectionId}
                      className="bg-white rounded-lg border-2 border-purple-200 shadow p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                        <span className="text-sm text-gray-500">Section {idx + 1}</span>
                      </div>
                      <textarea
                        value={section.content}
                        onChange={(e) => {
                          const updated = [...sectionContents];
                          updated[idx].content = e.target.value;
                          updated[idx].isComplete = e.target.value.length > 0;
                          setSectionContents(updated);
                        }}
                        placeholder="Add content for this section (optional)..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Review */}
            {currentStep === 'review' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Create</h2>
                <div className="space-y-6">
                  {/* Plan Summary */}
                  <div className="bg-white rounded-lg border-2 border-purple-200 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Summary</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Template</dt>
                        <dd className="text-base text-gray-900">{selectedTemplate?.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Title</dt>
                        <dd className="text-base text-gray-900">{planBasics.title}</dd>
                      </div>
                      {planBasics.description && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Description</dt>
                          <dd className="text-base text-gray-900">{planBasics.description}</dd>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Effective Date</dt>
                          <dd className="text-base text-gray-900">
                            {planBasics.effectiveDate || 'Not set'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Expiration Date</dt>
                          <dd className="text-base text-gray-900">
                            {planBasics.expirationDate || 'Not set'}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  {/* Sections Summary */}
                  <div className="bg-white rounded-lg border-2 border-purple-200 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sections</h3>
                    <div className="space-y-2">
                      {sectionContents.map((section) => (
                        <div
                          key={section.sectionId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-900">{section.title}</span>
                          {section.isComplete ? (
                            <CheckCircledIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <span className="text-xs text-gray-500">Empty</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-purple-200 shadow-lg">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 'template' || isCreating}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3">
                {currentStep !== 'review' ? (
                  <button
                    onClick={handleNextStep}
                    disabled={!canProceed()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCreatePlan}
                    disabled={isCreating}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Plan...
                      </>
                    ) : (
                      <>
                        <CheckCircledIcon className="w-5 h-5" />
                        Create Plan
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
