'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import type { PlanTemplate, UpdatePlanTemplate } from '@/lib/contracts/plan-template.contract';
import type { TemplateSection } from '@/lib/contracts/template-section.contract';

interface SectionData extends TemplateSection {}

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<PlanTemplate | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/plan-templates/${id}`);
      if (!response.ok) throw new Error('Failed to fetch template');

      const data = await response.json();
      setTemplate(data.template);
      setSections(data.template.sections || []);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!template) return;

    const newSection = {
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

    try {
      const response = await fetch(`/api/plan-templates/${id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      });

      if (!response.ok) throw new Error('Failed to add section');

      const data = await response.json();
      setSections([...sections, data.section]);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const removeSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/plan-templates/${id}/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete section');

      setSections(sections.filter(s => s.id !== sectionId));
    } catch (error) {
      console.error('Error removing section:', error);
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<SectionData>) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      const response = await fetch(`/api/plan-templates/${id}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...section, ...updates }),
      });

      if (!response.ok) throw new Error('Failed to update section');

      setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    newSections.forEach((s, i) => s.orderIndex = i);
    setSections(newSections);
    // TODO: Persist order changes
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    newSections.forEach((s, i) => s.orderIndex = i);
    setSections(newSections);
    // TODO: Persist order changes
  };

  const addTag = () => {
    if (!template || !tagInput.trim() || template.tags?.includes(tagInput.trim())) return;

    const updatedTags = [...(template.tags || []), tagInput.trim()];
    setTemplate({ ...template, tags: updatedTags });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      tags: template.tags?.filter(t => t !== tag),
    });
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const updateData: UpdatePlanTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        status: template.status,
      };

      const response = await fetch(`/api/plan-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update template');

      alert('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async () => {
    try {
      const response = await fetch(`/api/plan-templates/${id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Copy of ${template?.name}`,
          createdBy: 'current-user', // TODO: Get from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to clone template');

      const data = await response.json();
      router.push(`/templates/${data.template.id}`);
    } catch (error) {
      console.error('Error cloning template:', error);
      alert('Failed to clone template');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">Template not found</div>
      </div>
    );
  }

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
                {template.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {template.code} • {template.isSystemTemplate ? 'System Template' : 'Custom Template'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
              Clone
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Template Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Template Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  disabled={template.isSystemTemplate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Code
                </label>
                <input
                  type="text"
                  value={template.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Type
                </label>
                <input
                  type="text"
                  value={template.planType}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={template.category || ''}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  disabled={template.isSystemTemplate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={template.description || ''}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  disabled={template.isSystemTemplate}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      {!template.isSystemTemplate && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-purple-200 rounded-full p-0.5"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {!template.isSystemTemplate && (
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
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={template.status}
                  onChange={(e) => setTemplate({ ...template, status: e.target.value as any })}
                  disabled={template.isSystemTemplate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DEPRECATED">Deprecated</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Count
                </label>
                <input
                  type="text"
                  value={template.usageCount || 0}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Template Sections ({sections.length})
              </h2>
              {!template.isSystemTemplate && (
                <button
                  onClick={addSection}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Section
                </button>
              )}
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No sections in this template</p>
                {!template.isSystemTemplate && (
                  <button
                    onClick={addSection}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add First Section
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start gap-4">
                      {/* Order Controls */}
                      {!template.isSystemTemplate && (
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
                      )}

                      {/* Section Info */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              disabled={template.isSystemTemplate}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={section.sectionKey}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            value={section.description || ''}
                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                            disabled={template.isSystemTemplate}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={section.isRequired}
                              onChange={(e) => updateSection(section.id, { isRequired: e.target.checked })}
                              disabled={template.isSystemTemplate}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                            />
                            Required
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={section.isRepeatable}
                              onChange={(e) => updateSection(section.id, { isRepeatable: e.target.checked })}
                              disabled={template.isSystemTemplate}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                            />
                            Repeatable
                          </label>
                        </div>
                      </div>

                      {/* Remove Button */}
                      {!template.isSystemTemplate && (
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
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
