'use client';

import React, { useState, useEffect } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { DemoBadge } from '@/components/demo/DemoBadge';
import { TrashIcon, DownloadIcon, EyeOpenIcon, Cross2Icon } from '@radix-ui/react-icons';
import Link from 'next/link';

interface DemoItem {
  id: string;
  type: 'document' | 'case' | 'approval' | 'policy' | 'committee' | 'territory' | 'plan' | 'template';
  title: string;
  code?: string;
  owner?: string;
  createdAt: string;
  demoMetadata?: {
    year?: number;
    bu?: string;
    division?: string;
    category?: string;
  } | null;
}

export default function DemoLibraryPage() {
  const [demoItems, setDemoItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch all demo items from different endpoints
  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        // In a real implementation, this would fetch from multiple API endpoints
        // For now, we'll simulate with documents
        const response = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
        const data = await response.json();

        const items: DemoItem[] = (data.documents || [])
          .filter((doc: any) => doc.isDemo)
          .map((doc: any) => ({
            id: doc.id,
            type: 'document' as const,
            title: doc.title,
            code: doc.documentCode,
            owner: doc.owner,
            createdAt: doc.createdAt,
            demoMetadata: doc.demoMetadata,
          }));

        setDemoItems(items);
      } catch (error) {
        console.error('Failed to fetch demo items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoData();
  }, []);

  // Filtered items
  const filteredItems = demoItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  // Statistics
  const stats = {
    total: demoItems.length,
    documents: demoItems.filter(i => i.type === 'document').length,
    cases: demoItems.filter(i => i.type === 'case').length,
    approvals: demoItems.filter(i => i.type === 'approval').length,
    policies: demoItems.filter(i => i.type === 'policy').length,
    committees: demoItems.filter(i => i.type === 'committee').length,
    territories: demoItems.filter(i => i.type === 'territory').length,
    plans: demoItems.filter(i => i.type === 'plan').length,
    templates: demoItems.filter(i => i.type === 'template').length,
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all
  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map(i => i.id)));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  // Delete selected items
  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;

    try {
      // In a real implementation, this would call delete APIs for each selected item
      console.log(`Deleting ${selectedItems.size} demo items:`, Array.from(selectedItems));

      // Optimistically remove from local state
      setDemoItems(prev => prev.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete demo items:', error);
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      document: '📄',
      case: '📋',
      approval: '✅',
      policy: '📜',
      committee: '👥',
      territory: '🗺️',
      plan: '📊',
      template: '📝',
    };
    return icons[type] || '📦';
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      document: 'bg-blue-50 text-blue-700 border-blue-200',
      case: 'bg-green-50 text-green-700 border-green-200',
      approval: 'bg-purple-50 text-purple-700 border-purple-200',
      policy: 'bg-red-50 text-red-700 border-red-200',
      committee: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      territory: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      plan: 'bg-pink-50 text-pink-700 border-pink-200',
      template: 'bg-teal-50 text-teal-700 border-teal-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <>
      <SetPageTitle
        title="Demo Library"
        description="Manage all demo/sample data in one place - keep to learn or remove when ready"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Demo Data Library</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.total} sample items • Keep to learn the system or remove when ready
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{stats.documents}</div>
                <div className="text-sm text-blue-600 mt-1">Documents</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-3xl font-bold text-green-700">{stats.cases}</div>
                <div className="text-sm text-green-600 mt-1">Cases</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-700">{stats.approvals}</div>
                <div className="text-sm text-purple-600 mt-1">Approvals</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="text-3xl font-bold text-orange-700">{stats.total}</div>
                <div className="text-sm text-orange-600 mt-1">Total Items</div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types ({stats.total})</option>
                  <option value="document">Documents ({stats.documents})</option>
                  <option value="case">Cases ({stats.cases})</option>
                  <option value="approval">Approvals ({stats.approvals})</option>
                  <option value="policy">Policies ({stats.policies})</option>
                  <option value="committee">Committees ({stats.committees})</option>
                  <option value="territory">Territories ({stats.territories})</option>
                  <option value="plan">Plans ({stats.plans})</option>
                  <option value="template">Templates ({stats.templates})</option>
                </select>

                {/* Selection Controls */}
                <div className="flex items-center gap-2 pl-4 border-l border-gray-300">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                  {selectedItems.size > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={deselectAll}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Deselect All
                      </button>
                    </>
                  )}
                </div>

                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2 pl-4 border-l border-gray-300">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedItems.size} selected
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Selected ({selectedItems.size})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Item List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading demo items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No demo items found</p>
                <p className="text-sm text-gray-500">All demo data has been removed</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                    style={{
                      borderLeft: selectedItems.has(item.id) ? '3px solid #FF6B35' : '3px solid transparent',
                      backgroundColor: selectedItems.has(item.id) ? 'rgba(255, 107, 53, 0.04)' : undefined,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />

                      {/* Type Icon */}
                      <div className={`flex-none w-12 h-12 rounded-lg flex items-center justify-center border ${getTypeColor(item.type)}`}>
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <DemoBadge isDemo={true} demoMetadata={item.demoMetadata} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {item.code && (
                            <>
                              <span className="font-mono">{item.code}</span>
                              <span>•</span>
                            </>
                          )}
                          <span className="capitalize">{item.type}</span>
                          {item.owner && (
                            <>
                              <span>•</span>
                              <span>{item.owner}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                          title="View Item"
                        >
                          <EyeOpenIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItems(new Set([item.id]));
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="Delete Item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Delete Demo Items?</h2>
                <p className="text-sm text-gray-600">
                  You are about to delete <strong>{selectedItems.size}</strong> demo item{selectedItems.size !== 1 ? 's' : ''}.
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
