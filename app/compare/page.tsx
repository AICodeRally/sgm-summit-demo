'use client';

import React, { useState, useMemo } from 'react';
import {
  FileTextIcon,
  ClockIcon,
  PersonIcon,
  CheckCircledIcon,
  UpdateIcon,
  ArrowRightIcon,
  DotFilledIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';
import {
  DOCUMENT_VERSIONS,
  VERSION_STATS,
  getDocumentVersions,
  getVersion,
  compareVersions,
  DocumentVersion,
  VersionDiff,
} from '@/lib/data/synthetic/versions.data';

export default function VersionComparePage() {
  const [selectedDocCode, setSelectedDocCode] = useState<string>('SCP-001');
  const [oldVersionId, setOldVersionId] = useState<string>('ver-001-v2');
  const [newVersionId, setNewVersionId] = useState<string>('ver-001-v3');

  // Get unique document codes
  const documentCodes = useMemo(() => {
    const codes = new Set(DOCUMENT_VERSIONS.map(v => v.documentCode));
    return Array.from(codes).sort();
  }, []);

  // Get versions for selected document
  const versions = useMemo(() => {
    return getDocumentVersions(selectedDocCode);
  }, [selectedDocCode]);

  // Get selected versions
  const oldVersion = useMemo(() => getVersion(oldVersionId), [oldVersionId]);
  const newVersion = useMemo(() => getVersion(newVersionId), [newVersionId]);

  // Get diff
  const diffs = useMemo(() => {
    if (oldVersionId && newVersionId) {
      return compareVersions(oldVersionId, newVersionId);
    }
    return [];
  }, [oldVersionId, newVersionId]);

  // Get change type color
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'deletion':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'modification':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  // Get change type badge color
  const getChangeBadgeColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'deletion':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'modification':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                Version Compare
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Side-by-side document version comparison
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-purple-700">{VERSION_STATS.totalVersions}</span>
                <span className="text-purple-600 ml-1">versions</span>
              </div>
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-green-700">{VERSION_STATS.recentUpdates}</span>
                <span className="text-green-600 ml-1">recent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Document & Version Selector */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {/* Document Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document
                </label>
                <select
                  value={selectedDocCode}
                  onChange={(e) => {
                    setSelectedDocCode(e.target.value);
                    const newVersions = getDocumentVersions(e.target.value);
                    if (newVersions.length >= 2) {
                      setNewVersionId(newVersions[0].id);
                      setOldVersionId(newVersions[1].id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {documentCodes.map(code => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Old Version Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Compare From (Old)
                </label>
                <select
                  value={oldVersionId}
                  onChange={(e) => setOldVersionId(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.version} - {new Date(version.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* New Version Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Compare To (New)
                </label>
                <select
                  value={newVersionId}
                  onChange={(e) => setNewVersionId(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.version} - {new Date(version.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Version Timeline */}
          <div className="w-80 border-r border-purple-200 bg-white/90 backdrop-blur-sm overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-purple-600" />
                Version History
              </h3>

              <div className="space-y-3">
                {versions.map((version, index) => {
                  const isOld = version.id === oldVersionId;
                  const isNew = version.id === newVersionId;
                  const isSelected = isOld || isNew;

                  return (
                    <div
                      key={version.id}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-purple-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      {/* Timeline connector */}
                      {index < versions.length - 1 && (
                        <div className="absolute left-5 top-full w-0.5 h-3 bg-purple-200"></div>
                      )}

                      {/* Version badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <FileTextIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{version.version}</p>
                            {isOld && (
                              <span className="text-xs text-purple-600 font-medium">Old</span>
                            )}
                            {isNew && (
                              <span className="text-xs text-purple-600 font-medium">New</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(version.status)}`}>
                          {version.status}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <PersonIcon className="w-3 h-3" />
                          <span>{version.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Changes summary */}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {version.changesSummary}
                      </p>

                      {/* Change count */}
                      {version.changeCount > 0 && (
                        <div className="mt-2 pt-2 border-t border-purple-100">
                          <span className="text-xs text-purple-600 font-medium">
                            {version.changeCount} {version.changeCount === 1 ? 'change' : 'changes'}
                          </span>
                        </div>
                      )}

                      {/* Select buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setOldVersionId(version.id)}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            isOld
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          Set as Old
                        </button>
                        <button
                          onClick={() => setNewVersionId(version.id)}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            isNew
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          Set as New
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center - Comparison Results */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Comparison Header */}
            {oldVersion && newVersion && (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                  {/* Old Version */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileTextIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-600">From</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{oldVersion.version}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(oldVersion.createdAt).toLocaleDateString()} • {oldVersion.createdBy}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="px-6">
                    <ArrowRightIcon className="w-8 h-8 text-purple-600" />
                  </div>

                  {/* New Version */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-600">To</span>
                      <UpdateIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{newVersion.version}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(newVersion.createdAt).toLocaleDateString()} • {newVersion.createdBy}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <p className="text-sm text-gray-700">
                    <strong>Changes:</strong> {newVersion.changesSummary}
                  </p>
                  <p className="text-sm text-purple-600 font-medium mt-1">
                    {diffs.length} {diffs.length === 1 ? 'section' : 'sections'} modified
                  </p>
                </div>
              </div>
            )}

            {/* Diff Results */}
            {diffs.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200">
                <CheckCircledIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No differences found between versions</p>
              </div>
            ) : (
              <div className="space-y-6">
                {diffs.map((diff, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ChevronRightIcon className="w-4 h-4 text-purple-600" />
                        {diff.sectionTitle}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {diff.changes.length} {diff.changes.length === 1 ? 'change' : 'changes'} detected
                      </p>
                    </div>

                    {/* Changes */}
                    <div className="p-4 space-y-4">
                      {diff.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="space-y-2">
                          {/* Change Type Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded border uppercase ${getChangeBadgeColor(change.type)}`}>
                              {change.type}
                            </span>
                            {change.context && (
                              <span className="text-xs text-gray-500">{change.context}</span>
                            )}
                          </div>

                          {/* Side by Side Comparison */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Old Text */}
                            {change.oldText && (
                              <div className={`p-3 rounded border ${
                                change.type === 'deletion' ? getChangeColor('deletion') : 'bg-gray-50 border-gray-200'
                              }`}>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Old Version</p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {change.oldText}
                                </p>
                              </div>
                            )}

                            {/* New Text */}
                            {change.newText && (
                              <div className={`p-3 rounded border ${
                                change.type === 'addition' ? getChangeColor('addition') : getChangeColor('modification')
                              }`}>
                                <p className="text-xs font-semibold text-gray-600 mb-1">New Version</p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {change.newText}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
