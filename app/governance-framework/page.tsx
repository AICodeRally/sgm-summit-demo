'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReaderIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import type { GovernanceFramework } from '@/lib/contracts/governance-framework.contract';

export default function GovernanceFrameworkPage() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<GovernanceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchFrameworks();
  }, [categoryFilter, statusFilter]);

  const fetchFrameworks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tenantId: 'demo-tenant-001',
      });

      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/governance-framework?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch frameworks');

      const data = await response.json();
      setFrameworks(data.frameworks || []);
    } catch (error) {
      console.error('Error fetching frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFrameworks = frameworks.filter((framework) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      framework.title.toLowerCase().includes(query) ||
      framework.code.toLowerCase().includes(query) ||
      framework.content.toLowerCase().includes(query)
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return <ReaderIcon className="h-5 w-5" />;
      case 'STANDARDS':
        return <CheckCircledIcon className="h-5 w-5" />;
      case 'COMPLIANCE':
        return <LockClosedIcon className="h-5 w-5" />;
      case 'REGULATORY':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <FileTextIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'STANDARDS':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'COMPLIANCE':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'REGULATORY':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'BEST_PRACTICES':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            Governance Framework Library
          </h1>
          <p className="text-gray-600">
            SPM governance guardrails for compensation planning and policy creation
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="METHODOLOGY">Methodology</option>
              <option value="STANDARDS">Standards</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="BEST_PRACTICES">Best Practices</option>
              <option value="REGULATORY">Regulatory</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="SUPERSEDED">Superseded</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Framework Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading frameworks...</div>
            </div>
          ) : filteredFrameworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileTextIcon className="h-16 w-16 mb-4 text-gray-300" />
              <p>No governance frameworks found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFrameworks.map((framework) => (
                <div
                  key={framework.id}
                  onClick={() => router.push(`/governance-framework/${framework.id}`)}
                  className="bg-white/80 backdrop-blur-sm rounded-lg border-2 border-purple-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg border-2 ${getCategoryColor(framework.category)}`}>
                      {getCategoryIcon(framework.category)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {framework.isMandatory && (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded border border-red-300">
                          MANDATORY
                        </span>
                      )}
                      {framework.isGlobal && (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded border border-blue-300">
                          GLOBAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="text-sm font-mono text-purple-600 mb-2">
                    {framework.code}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {framework.title}
                  </h3>

                  {/* Category */}
                  <div className="text-sm text-gray-600 mb-3">
                    {framework.category.replace('_', ' ')}
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {framework.content.substring(0, 150)}...
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Version {framework.version}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      framework.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : framework.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {framework.status}
                    </span>
                  </div>

                  {/* Applicable To */}
                  {framework.applicableTo && framework.applicableTo.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Applicable to:</div>
                      <div className="flex flex-wrap gap-1">
                        {framework.applicableTo.map((planType: string) => (
                          <span
                            key={planType}
                            className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded"
                          >
                            {planType.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
