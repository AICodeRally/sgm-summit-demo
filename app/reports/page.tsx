'use client';

import React, { useState } from 'react';
import {
  DownloadIcon,
  FileTextIcon,
  BarChartIcon,
  ClockIcon,
  CheckCircledIcon,
  LayersIcon,
  ExclamationTriangleIcon,
  LoopIcon,
  ArchiveIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  REPORT_TEMPLATES,
  GENERATED_REPORTS,
  REPORT_STATS,
  getReportsByCategory,
  ReportTemplate,
  GeneratedReport,
  ReportFormat,
  ReportCategory,
} from '@/lib/data/synthetic/reports.data';

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter templates by category
  const filteredTemplates = filterCategory === 'all'
    ? REPORT_TEMPLATES
    : REPORT_TEMPLATES.filter(t => t.category === filterCategory);

  // Get icon for report
  const getReportIcon = (icon: string) => {
    switch (icon) {
      case 'FileCheck':
        return CheckCircledIcon;
      case 'FileText':
        return FileTextIcon;
      case 'Archive':
        return ArchiveIcon;
      case 'BarChart':
        return BarChartIcon;
      case 'TrendingUp':
        return BarChartIcon;
      case 'Users':
        return LayersIcon;
      case 'FileStack':
        return LayersIcon;
      case 'Loop':
        return LoopIcon;
      case 'ExclamationTriangle':
        return ExclamationTriangleIcon;
      default:
        return FileTextIcon;
    }
  };

  // Get category color
  const getCategoryColor = (category: ReportCategory) => {
    switch (category) {
      case 'COMPLIANCE':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PERFORMANCE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'OPERATIONS':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'AUDIT':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-purple-200';
    }
  };

  // Get format badge color
  const getFormatColor = (format: ReportFormat) => {
    switch (format) {
      case 'PDF':
        return 'bg-red-100 text-red-700';
      case 'EXCEL':
        return 'bg-green-100 text-green-700';
      case 'CSV':
        return 'bg-blue-100 text-blue-700';
      case 'JSON':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <SetPageTitle
        title="Reports & Export"
        description="9 pre-built report templates with multiple export formats"
      />
      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-purple-700">{REPORT_STATS.totalTemplates}</span>
                <span className="text-purple-600 ml-1">templates</span>
              </div>
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-green-700">{REPORT_STATS.recentlyGenerated}</span>
                <span className="text-green-600 ml-1">this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Report Templates */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
              }`}
            >
              All Templates ({REPORT_TEMPLATES.length})
            </button>
            <button
              onClick={() => setFilterCategory('COMPLIANCE')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'COMPLIANCE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
              }`}
            >
              Compliance ({REPORT_STATS.byCategory.COMPLIANCE})
            </button>
            <button
              onClick={() => setFilterCategory('PERFORMANCE')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'PERFORMANCE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
              }`}
            >
              Performance ({REPORT_STATS.byCategory.PERFORMANCE})
            </button>
            <button
              onClick={() => setFilterCategory('OPERATIONS')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'OPERATIONS'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
              }`}
            >
              Operations ({REPORT_STATS.byCategory.OPERATIONS})
            </button>
            <button
              onClick={() => setFilterCategory('AUDIT')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'AUDIT'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
              }`}
            >
              Audit ({REPORT_STATS.byCategory.AUDIT})
            </button>
          </div>

          {/* Report Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredTemplates.map(template => {
              const Icon = getReportIcon(template.icon);
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedFormat(template.supportedFormats[0]);
                  }}
                  className={`text-left p-5 rounded-lg border-2 transition-all hover:shadow-lg ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-fuchsia-50'
                      : 'border-purple-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'
                  }`}
                >
                  {/* Icon & Category */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{template.estimatedTime}</span>
                  </div>

                  {/* Formats */}
                  <div className="flex items-center gap-1 mt-3">
                    {template.supportedFormats.map(format => (
                      <span
                        key={format}
                        className={`text-xs font-medium px-2 py-0.5 rounded ${getFormatColor(format)}`}
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recent Reports */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ArchiveIcon className="w-5 h-5 text-purple-600" />
              Recently Generated Reports
            </h2>

            <div className="space-y-2">
              {GENERATED_REPORTS.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FileTextIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {report.templateName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{report.generatedBy}</span>
                        <span>•</span>
                        <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`font-medium ${getFormatColor(report.format)} px-1.5 py-0.5 rounded`}>
                          {report.format}
                        </span>
                        <span>•</span>
                        <span>{report.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
                    <DownloadIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Report Configuration */}
        {selectedTemplate && (
          <div className="w-96 border-l border-purple-200 bg-white/90 backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              {/* Template Info */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  {(() => {
                    const Icon = getReportIcon(selectedTemplate.icon);
                    return (
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedTemplate.name}
                    </h2>
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded border mt-1 ${getCategoryColor(selectedTemplate.category)}`}>
                      {selectedTemplate.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedTemplate.description}
                </p>

                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Estimated generation time: {selectedTemplate.estimatedTime}</span>
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.supportedFormats.map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedFormat === format
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Parameters</h3>
                <div className="space-y-4">
                  {selectedTemplate.parameters.map(param => (
                    <div key={param.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {param.label}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {param.type === 'select' && param.options && (
                        <select className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                          {param.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {param.type === 'multi_select' && param.options && (
                        <div className="space-y-1 border border-purple-200 rounded-md p-2 max-h-40 overflow-y-auto">
                          {param.options.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 text-sm p-1 hover:bg-purple-50 rounded">
                              <input type="checkbox" className="rounded border-purple-300" />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {param.type === 'date_range' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            className="px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Start date"
                          />
                          <input
                            type="date"
                            className="px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="End date"
                          />
                        </div>
                      )}

                      {param.type === 'boolean' && (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            defaultChecked={param.defaultValue}
                            className="rounded border-purple-300"
                          />
                          <span className="text-gray-600">Enable this option</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <DownloadIcon className="w-5 h-5" />
                Generate Report
              </button>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-purple-50 rounded-md">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> Report generation may take a few minutes depending on the data range and parameters selected. You'll receive a notification when it's ready for download.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
