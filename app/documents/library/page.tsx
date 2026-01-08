'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircledIcon,
  UpdateIcon,
  ArchiveIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface DocumentWithVersions {
  id: string;
  documentCode: string;
  title: string;
  description?: string;
  documentType: string;
  category?: string;
  status: string;
  owner: string;
  createdAt: string;
  lastUpdated: string;
  versionStats: {
    totalVersions: number;
    latestVersion: string;
    activeVersion?: string;
    versionsByStatus: Record<string, number>;
  };
}

export default function DocumentLibraryPage() {
  const [documents, setDocuments] = useState<DocumentWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/documents?includeVersions=true');
      // const data = await response.json();

      // Mock data for now
      setDocuments([
        {
          id: 'doc-1',
          documentCode: 'HS-MED-FSC-2025',
          title: 'Medical Surgical Field Sales Consultant Plan',
          description: 'FY2025 compensation plan for Medical Division FSC roles',
          documentType: 'COMPENSATION_PLAN',
          category: 'Compensation',
          status: 'ACTIVE',
          owner: 'Todd LeBaron',
          createdAt: new Date('2024-11-15').toISOString(),
          lastUpdated: new Date('2025-01-08').toISOString(),
          versionStats: {
            totalVersions: 5,
            latestVersion: '1.2.0',
            activeVersion: '1.2.0',
            versionsByStatus: {
              RAW: 1,
              PROCESSED: 1,
              DRAFT: 1,
              APPROVED: 1,
              ACTIVE_FINAL: 1,
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter !== 'all') {
      if (filter === 'active' && doc.status !== 'ACTIVE') return false;
      if (filter === 'draft' && doc.status !== 'DRAFT') return false;
      if (filter === 'archived' && doc.status !== 'ARCHIVED') return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.documentCode.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <UpdateIcon className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Documents...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <SetPageTitle
        title="Document Library"
        description="Full provenance tracking for all documents"
      />

      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Home
                </Link>
                <div className="h-6 w-px bg-purple-300"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                    Document Library
                  </h1>
                  <p className="text-sm text-gray-600">
                    {filteredDocuments.length} documents • Full version history
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setFilter('all')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-purple-50')}
              >
                All Documents
              </button>
              <button
                onClick={() => setFilter('active')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'active' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-green-50')}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'draft' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 hover:bg-yellow-50')}
              >
                Draft
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'archived' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50')}
              >
                Archived
              </button>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <FileTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h2>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}/versions`}
                    className="block"
                  >
                    <div className="bg-white rounded-xl border-2 border-purple-200 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileTextIcon className="w-6 h-6 text-purple-600" />
                            <h2 className="text-xl font-bold text-gray-900">{doc.title}</h2>
                            <span className={'px-3 py-1 rounded-full text-xs font-semibold border ' + getStatusColor(doc.status)}>
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Code: <span className="font-mono font-medium text-gray-700">{doc.documentCode}</span>
                          </p>
                          {doc.description && (
                            <p className="text-gray-700 mb-3">{doc.description}</p>
                          )}
                        </div>

                        <div className="text-right ml-6">
                          <div className="text-3xl font-bold text-purple-600">
                            {doc.versionStats.totalVersions}
                          </div>
                          <div className="text-xs text-gray-600">versions</div>
                        </div>
                      </div>

                      {/* Version Stats */}
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Latest Version</div>
                          <div className="font-mono font-bold text-gray-900">
                            {doc.versionStats.latestVersion}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Active Version</div>
                          <div className="font-mono font-bold text-green-600">
                            {doc.versionStats.activeVersion || 'None'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Owner</div>
                          <div className="font-medium text-gray-900">{doc.owner}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                          <div className="text-sm text-gray-700">
                            {new Date(doc.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Version Status Breakdown */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-600">Version Status:</div>
                        {Object.entries(doc.versionStats.versionsByStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-700">{status}:</span>
                            <span className="text-xs font-bold text-purple-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
