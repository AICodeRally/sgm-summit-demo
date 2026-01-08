'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { GovernanceFramework } from '@/lib/contracts/governance-framework.contract';

interface FrameworkViewerPageProps {
  params: Promise<{ id: string }>;
}

export default function FrameworkViewerPage({ params }: FrameworkViewerPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [framework, setFramework] = useState<GovernanceFramework | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFramework();
  }, [id]);

  const fetchFramework = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/governance-framework/${id}`);
      if (!response.ok) throw new Error('Failed to fetch framework');

      const data = await response.json();
      setFramework(data.framework);
    } catch (error) {
      console.error('Error fetching framework:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return <BookOpenIcon className="h-6 w-6" />;
      case 'STANDARDS':
        return <CheckBadgeIcon className="h-6 w-6" />;
      case 'COMPLIANCE':
        return <ShieldCheckIcon className="h-6 w-6" />;
      case 'REGULATORY':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      default:
        return <DocumentTextIcon className="h-6 w-6" />;
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

  // Simple markdown rendering (headers, bold, italic, lists)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold text-gray-900 mt-6 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-5 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>;
      }

      // Lists
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-6 text-gray-700">{line.slice(2)}</li>;
      }

      // Bold and italic
      let formatted = line;
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

      if (line.trim() === '') {
        return <br key={i} />;
      }

      return <p key={i} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        <div className="text-gray-500">Loading framework...</div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        <div className="text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500">Framework not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-8 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/governance-framework"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg border-2 ${getCategoryColor(framework.category)}`}>
                    {getCategoryIcon(framework.category)}
                  </div>
                  <div>
                    <div className="text-sm font-mono text-purple-600">{framework.code}</div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                      {framework.title}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {framework.category.replace('_', ' ')}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">
                    Version {framework.version}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    framework.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : framework.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {framework.status}
                  </span>
                  {framework.isMandatory && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded border border-red-300">
                        MANDATORY
                      </span>
                    </>
                  )}
                  {framework.isGlobal && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded border border-blue-300">
                        GLOBAL
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border-2 border-purple-200 p-8">
            {/* Applicable To */}
            {framework.applicableTo && framework.applicableTo.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Applicable To:</h3>
                <div className="flex flex-wrap gap-2">
                  {framework.applicableTo.map((planType: string) => (
                    <span
                      key={planType}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {planType.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Framework Content */}
            <div className="prose prose-sm max-w-none">
              {renderMarkdown(framework.content)}
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Created By:</span>
                  <span className="ml-2 text-gray-600">{framework.createdBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(framework.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(framework.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Version:</span>
                  <span className="ml-2 text-gray-600">{framework.version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
