'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileTextIcon,
  GearIcon,
  ReaderIcon,
  ArchiveIcon,
  CheckboxIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CaretSortIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';

interface Document {
  id: string;
  documentCode: string;
  title: string;
  documentType: string;
  category?: string;
  status: string;
  version: string;
  lastUpdated: string;
  owner: string;
  description?: string;
  effectiveDate?: string;
}

interface FilterState {
  status?: string;
  documentType?: string;
  category?: string;
  search?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchInput, setSearchInput] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [sortBy, setSortBy] = useState<'updated' | 'code' | 'title'>('updated');

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.documentType) queryParams.append('documentType', filters.documentType);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.search) queryParams.append('search', filters.search);
        queryParams.append('tenantId', 'demo-tenant-001');

        const response = await fetch(`/api/sgm/documents?${queryParams}`);
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  // Get unique document types and categories
  const documentTypes = ['FRAMEWORK', 'POLICY', 'PROCEDURE', 'TEMPLATE', 'CHECKLIST', 'GUIDE'];
  const statuses = ['DRAFT', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ARCHIVED'];
  const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  // Status color mapping
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Document type icon - Using Radix icons
  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      FRAMEWORK: ArchiveIcon,
      POLICY: FileTextIcon,
      PROCEDURE: GearIcon,
      TEMPLATE: ReaderIcon,
      CHECKLIST: CheckboxIcon,
      GUIDE: BookmarkIcon,
    };
    return iconMap[type] || FileTextIcon;
  };

  // Left Nav - Filters and saved views
  const leftNav = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Document Type
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(prev => ({ ...prev, documentType: undefined }))}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              !filters.documentType
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Documents
          </button>
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, documentType: type }))}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                filters.documentType === type
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {React.createElement(getDocumentIcon(type), { className: 'w-4 h-4' })}
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Status
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              !filters.status
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Statuses
          </button>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({ ...prev, status }))}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                filters.status === status
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Center Content - Document list
  const centerContent = (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Document Library</h1>
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            New Document
          </Link>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents by title, code, or content..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'updated' ? 'code' : 'updated')}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <CaretSortIcon className="w-4 h-4" />
            Sort
          </button>
        </form>

        {/* Results count */}
        <div className="mt-2 text-xs text-gray-500">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
          {filters.documentType && ` • Type: ${filters.documentType}`}
          {filters.status && ` • Status: ${filters.status.replace(/_/g, ' ')}`}
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileTextIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No documents found</p>
            <p className="text-sm text-gray-500 mb-4">Get started by creating your first document</p>
            <Link
              href="/documents/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4" />
              New Document
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map(doc => {
              const IconComponent = getDocumentIcon(doc.documentType);
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-none mt-0.5">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {doc.documentCode} • v{doc.version}
                          </p>
                        </div>
                        <span
                          className={`flex-none px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                            doc.status
                          )}`}
                        >
                          {doc.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{doc.owner}</span>
                        <span>•</span>
                        <span>Updated {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                        {doc.effectiveDate && (
                          <>
                            <span>•</span>
                            <span>Effective {new Date(doc.effectiveDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Right Detail Pane - Document preview/actions
  const rightDetail = selectedDoc ? (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{selectedDoc.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{selectedDoc.documentCode}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <DotsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                selectedDoc.status
              )}`}
            >
              {selectedDoc.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Document Type
            </h3>
            <p className="text-sm text-gray-900">{selectedDoc.documentType}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Version
            </h3>
            <p className="text-sm text-gray-900">v{selectedDoc.version}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Owner
            </h3>
            <p className="text-sm text-gray-900">{selectedDoc.owner}</p>
          </div>

          {selectedDoc.effectiveDate && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Effective Date
              </h3>
              <p className="text-sm text-gray-900">
                {new Date(selectedDoc.effectiveDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {selectedDoc.description && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-700">{selectedDoc.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Last Updated
            </h3>
            <p className="text-sm text-gray-900">
              {new Date(selectedDoc.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-none p-4 border-t border-purple-200">
        <Link
          href={`/documents/${selectedDoc.id}`}
          className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          View Full Document
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <div className="h-full">
      <ThreePaneWorkspace
        leftNav={leftNav}
        centerContent={centerContent}
        rightDetail={rightDetail}
        showRightPane={!!selectedDoc}
      />
    </div>
  );
}
