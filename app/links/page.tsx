'use client';

import React, { useState } from 'react';
import {
  Link2Icon,
  FileTextIcon,
  MagnifyingGlassIcon,
  LayersIcon,
  ArrowRightIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  DOCUMENT_NODES,
  DOCUMENT_LINKS,
  LINK_TYPE_INFO,
  GRAPH_STATS,
  getDocumentLinks,
  getRelatedDocuments,
  DocumentNode,
  DocumentLink,
  LinkType,
} from '@/lib/data/synthetic/document-links.data';

export default function DocumentLinksPage() {
  const [selectedNode, setSelectedNode] = useState<DocumentNode | null>(null);
  const [filterLinkType, setFilterLinkType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter documents
  const filteredNodes = searchQuery
    ? DOCUMENT_NODES.filter(node =>
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.documentCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : DOCUMENT_NODES;

  // Get links for selected node
  const selectedNodeLinks = selectedNode ? getDocumentLinks(selectedNode.documentCode) : [];
  const relatedDocs = selectedNode ? getRelatedDocuments(selectedNode.documentCode) : [];

  // Filter links by type
  const filteredLinks = filterLinkType === 'all'
    ? selectedNodeLinks
    : selectedNodeLinks.filter(link => link.linkType === filterLinkType);

  // Get node color by type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'FRAMEWORK':
        return 'bg-purple-500';
      case 'POLICY':
        return 'bg-blue-500';
      case 'PROCEDURE':
        return 'bg-green-500';
      case 'TEMPLATE':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <SetPageTitle
        title="Document Links Explorer"
        description="Interactive graph showing document relationships and dependencies"
      />
      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-purple-700">{GRAPH_STATS.totalDocuments}</span>
                <span className="text-purple-600 ml-1">documents</span>
              </div>
              <div className="bg-fuchsia-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-fuchsia-700">{GRAPH_STATS.totalLinks}</span>
                <span className="text-fuchsia-600 ml-1">links</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Document List */}
        <div className="w-80 border-r border-purple-200 bg-white/90 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Legend */}
            <div className="mb-4 p-3 bg-purple-50 rounded-md">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
                Node Types
              </p>
              <div className="space-y-1">
                {['FRAMEWORK', 'POLICY', 'PROCEDURE', 'TEMPLATE'].map(type => (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${getNodeColor(type)}`}></div>
                    <span className="text-gray-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document List */}
            <div className="space-y-1">
              {filteredNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-full text-left p-3 rounded-md transition-all ${
                    selectedNode?.id === node.id
                      ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 border-l-2 border-purple-500'
                      : 'hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getNodeColor(node.type)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {node.documentCode}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{node.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{node.incomingLinks} in</span>
                        <span>•</span>
                        <span>{node.outgoingLinks} out</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Graph Visualization */}
        <div className="flex-1 p-8">
          {selectedNode ? (
            <div className="h-full flex flex-col">
              {/* Selected Node Info */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200 p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${getNodeColor(selectedNode.type)} flex items-center justify-center flex-shrink-0`}>
                      <FileTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedNode.documentCode}</h2>
                      <p className="text-gray-600 mt-1">{selectedNode.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {selectedNode.type}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {selectedNode.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{selectedNodeLinks.length}</div>
                    <div className="text-xs text-gray-500">total links</div>
                  </div>
                </div>
              </div>

              {/* Link Type Filter */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterLinkType('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filterLinkType === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  All Links ({selectedNodeLinks.length})
                </button>
                {Object.entries(LINK_TYPE_INFO).map(([key, info]) => {
                  const count = selectedNodeLinks.filter(l => l.linkType === key).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterLinkType(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        filterLinkType === key
                          ? 'text-white'
                          : 'bg-white/80 text-gray-700 hover:bg-white'
                      }`}
                      style={{
                        backgroundColor: filterLinkType === key ? info.color : undefined,
                      }}
                    >
                      {info.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Links List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Link2Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No links of this type</p>
                  </div>
                ) : (
                  filteredLinks.map(link => {
                    const linkInfo = LINK_TYPE_INFO[link.linkType];
                    const isOutgoing = link.sourceDocCode === selectedNode.documentCode;
                    const otherDocCode = isOutgoing ? link.targetDocCode : link.sourceDocCode;
                    const otherDoc = DOCUMENT_NODES.find(n => n.documentCode === otherDocCode);

                    return (
                      <div
                        key={link.id}
                        className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {/* Direction indicator */}
                          <div className="flex-shrink-0 mt-1">
                            {isOutgoing ? (
                              <ArrowRightIcon className="w-5 h-5 text-purple-600" />
                            ) : (
                              <ArrowRightIcon className="w-5 h-5 text-purple-600 transform rotate-180" />
                            )}
                          </div>

                          <div className="flex-1">
                            {/* Link type badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: linkInfo.color }}
                              >
                                {linkInfo.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {isOutgoing ? 'to' : 'from'}
                              </span>
                            </div>

                            {/* Target document */}
                            {otherDoc && (
                              <button
                                onClick={() => setSelectedNode(otherDoc)}
                                className="text-left hover:bg-purple-50 rounded p-2 -m-2 transition-colors w-full"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getNodeColor(otherDoc.type)}`}></div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {otherDoc.documentCode}
                                  </p>
                                  <span className="text-xs text-gray-500">•</span>
                                  <p className="text-xs text-gray-600 truncate flex-1">
                                    {otherDoc.title}
                                  </p>
                                </div>
                              </button>
                            )}

                            {/* Description */}
                            {link.description && (
                              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                {link.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Link2Icon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Select a document to explore links</p>
                <p className="text-gray-500 text-sm">
                  {GRAPH_STATS.totalDocuments} documents • {GRAPH_STATS.totalLinks} relationships
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Related Documents */}
        {selectedNode && relatedDocs.length > 0 && (
          <div className="w-72 border-l border-purple-200 bg-white/90 backdrop-blur-sm overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <LayersIcon className="w-4 h-4 text-purple-600" />
                Related Documents ({relatedDocs.length})
              </h3>
              <div className="space-y-2">
                {relatedDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedNode(doc)}
                    className="w-full text-left p-3 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${getNodeColor(doc.type)}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {doc.documentCode}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{doc.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
