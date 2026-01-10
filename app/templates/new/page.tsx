'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import type { CreatePlanTemplate } from '@/lib/contracts/plan-template.contract';
import type { CreateTemplateSection } from '@/lib/contracts/template-section.contract';

type PlanType = 'COMPENSATION_PLAN' | 'GOVERNANCE_PLAN' | 'POLICY_CREATION_PLAN';

interface SectionFormData extends Omit<CreateTemplateSection, 'templateId'> {
  tempId: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<Partial<CreatePlanTemplate>>({
    tenantId: 'demo-tenant-001', // TODO: Get from auth
    code: '',
    name: '',
    description: '',
    planType: 'COMPENSATION_PLAN',
    category: '',
    tags: [],
    version: '1.0.0',
    status: 'DRAFT',
    source: 'USER_CREATED',
    isSystemTemplate: false,
    owner: 'current-user', // TODO: Get from auth
    createdBy: 'current-user', // TODO: Get from auth
  });

  const [sections, setSections] = useState<SectionFormData[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addSection = () => {
    const newSection: SectionFormData = {
      tempId: `temp-${Date.now()}`,
      sectionKey: `section-${sections.length + 1}`,
      title: `New Section ${sections.length + 1}`,
      description: '',
      orderIndex: sections.length,
      level: 0,
      isRequired: false,
      isRepeatable: false,
      contentTemplate: '',
      fieldDefinitions: [],
      aiAgentRoles: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (tempId: string) => {
    setSections(sections.filter(s => s.tempId !== tempId));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    newSections.forEach((s, i) => s.orderIndex = i);
    setSections(newSections);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    newSections.forEach((s, i) => s.orderIndex = i);
    setSections(newSections);
  };

  const updateSection = (tempId: string, updates: Partial<SectionFormData>) => {
    setSections(sections.map(s => s.tempId === tempId ? { ...s, ...updates } : s));
  };

  const addTag = () => {
    if (tagInput.trim() && !template.tags?.includes(tagInput.trim())) {
      setTemplate({
        ...template,
        tags: [...(template.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTemplate({
      ...template,
      tags: template.tags?.filter(t => t !== tag),
    });
  };

  const handleSave = async (status: 'DRAFT' | 'ACTIVE') => {
    setSaving(true);
    try {
      // Create template
      const templateData: CreatePlanTemplate = {
        ...template as CreatePlanTemplate,
        status,
      };

      const templateResponse = await fetch('/api/plan-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (!templateResponse.ok) throw new Error('Failed to create template');

      const { template: createdTemplate } = await templateResponse.json();

      // Create sections
      for (const section of sections) {
        const { tempId, ...sectionData } = section;
        await fetch(`/api/plan-templates/${createdTemplate.id}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionData),
        });
      }

      router.push('/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/templates"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                Create Template
              </h1>
              <p className="text-gray-600 mt-1">
                Build a reusable plan template with sections
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={saving || !template.name || !template.code}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('ACTIVE')}
              disabled={saving || !template.name || !template.code || sections.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? 'Saving...' : 'Save & Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Template Basics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Template Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="Annual Sales Compensation Plan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Code *
                </label>
                <input
                  type="text"
                  value={template.code}
                  onChange={(e) => setTemplate({ ...template, code: e.target.value })}
                  placeholder="TPL-COMP-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Type *
                </label>
                <select
                  value={template.planType}
                  onChange={(e) => setTemplate({ ...template, planType: e.target.value as PlanType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="COMPENSATION_PLAN">Compensation Plan</option>
                  <option value="GOVERNANCE_PLAN">Governance Plan</option>
                  <option value="POLICY_CREATION_PLAN">Policy Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={template.category}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  placeholder="Sales, Marketing, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  placeholder="Describe what this template is for..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {template.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <Cross2Icon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Template Sections
              </h2>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No sections added yet</p>
                <button
                  onClick={addSection}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add First Section
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={section.tempId}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start gap-4">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUpIcon className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="text-sm text-gray-500 text-center">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => moveSectionDown(index)}
                          disabled={index === sections.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Section Form */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(section.tempId, { title: e.target.value })}
                              placeholder="Section Title"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={section.sectionKey}
                              onChange={(e) => updateSection(section.tempId, { sectionKey: e.target.value })}
                              placeholder="section-key"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            value={section.description || ''}
                            onChange={(e) => updateSection(section.tempId, { description: e.target.value })}
                            placeholder="Section description..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={section.isRequired}
                              onChange={(e) => updateSection(section.tempId, { isRequired: e.target.checked })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            Required
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={section.isRepeatable}
                              onChange={(e) => updateSection(section.tempId, { isRepeatable: e.target.checked })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            Repeatable
                          </label>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeSection(section.tempId)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
