'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AvatarIcon,
  PersonIcon,
  CheckCircledIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  EnvelopeClosedIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { SGCC_COMMITTEE, CRB_COMMITTEE, CRB_DECISION_OPTIONS, type Committee } from '@/lib/data/synthetic/committees.data';
import { DemoBadge } from '@/components/demo/DemoBadge';
import { DemoWarningBanner } from '@/components/demo/DemoToggle';

const ALL_COMMITTEES = [SGCC_COMMITTEE, CRB_COMMITTEE];

export default function CommitteesPage() {
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(SGCC_COMMITTEE);
  const [activeTab, setActiveTab] = useState<'members' | 'authority' | 'decisions'>('members');

  // Left Nav - Committee list
  const leftNav = (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          Committees
        </h2>
        <div className="space-y-1">
          {ALL_COMMITTEES.map(committee => (
            <button
              key={committee.id}
              onClick={() => setSelectedCommittee(committee)}
              className={`w-full text-left px-3 py-3 rounded-md transition-colors ${
                selectedCommittee?.id === committee.id
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <AvatarIcon className={`w-5 h-5 flex-none mt-0.5 ${
                  selectedCommittee?.id === committee.id ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{committee.code}</p>
                    <DemoBadge isDemo={committee.isDemo} demoMetadata={committee.demoMetadata} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{committee.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <PersonIcon className="w-3 h-3" />
                    <span>{committee.members.length} members</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 bg-purple-50 rounded-md border border-purple-100">
        <p className="text-xs font-medium text-purple-900 mb-1">Committee Charters</p>
        <p className="text-xs text-purple-700">
          Review governance committee charters in the document library
        </p>
        <Link
          href="/documents"
          className="inline-block mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          View Documents →
        </Link>
      </div>
    </div>
  );

  // Center Content - Committee details
  const centerContent = selectedCommittee ? (
    <div className="flex flex-col h-full">
      {/* Demo Warning Banner */}
      {ALL_COMMITTEES.some(c => c.isDemo) && (
        <div className="px-4 pt-4">
          <DemoWarningBanner
            demoCount={ALL_COMMITTEES.filter(c => c.isDemo).length}
            onViewDemoLibrary={() => window.location.href = '/demo-library'}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex-none bg-white/90 backdrop-blur-sm border-b border-purple-200 px-6 py-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedCommittee.code}</h1>
            <p className="text-sm text-gray-600 mt-1">{selectedCommittee.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <DotFilledIcon className="w-3 h-3" />
              {selectedCommittee.status}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4">{selectedCommittee.purpose}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <PersonIcon className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Total Members</p>
              <p className="text-lg font-bold text-gray-900">{selectedCommittee.members.length}</p>
              <p className="text-xs text-gray-500">
                {selectedCommittee.members.filter(m => m.isVoting).length} voting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Meeting Cadence</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedCommittee.meetingCadence.split('(')[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircledIcon className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Quorum</p>
              <p className="text-sm font-semibold text-gray-900">{selectedCommittee.quorumRequirement}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-purple-200">
          {[
            { id: 'members', label: 'Members', icon: PersonIcon },
            { id: 'authority', label: 'Authority & Scope', icon: FileTextIcon },
            { id: 'decisions', label: 'Decision Framework', icon: CheckCircledIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-purple-300'
              }`}
            >
              {React.createElement(tab.icon, { className: 'w-4 h-4' })}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'members' && (
          <div className="space-y-3">
            {selectedCommittee.members.map(member => (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-purple-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-none w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <PersonIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        {member.isVoting ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Voting
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            Non-Voting
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-purple-600 font-medium mt-0.5">{member.role}</p>
                      <p className="text-sm text-gray-600 mt-1">{member.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{member.department}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <EnvelopeClosedIcon className="w-3 h-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3" />
                          Joined {new Date(member.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'authority' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Committee Authority</h3>
              <div className="bg-white rounded-lg border border-purple-200 p-4">
                <ul className="space-y-2">
                  {selectedCommittee.authority.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircledIcon className="w-4 h-4 text-green-600 flex-none mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Charter Document</h3>
              <Link href={`/documents/${selectedCommittee.charterDocument}`}>
                <div className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="w-10 h-10 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedCommittee.code} Committee Charter
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Document: {selectedCommittee.charterDocument}</p>
                      <p className="text-xs text-purple-600 mt-1 font-medium">View Document →</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Meeting Requirements</h3>
              <div className="bg-white rounded-lg border border-purple-200 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cadence</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedCommittee.meetingCadence}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quorum</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedCommittee.quorumRequirement}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-6">
            {selectedCommittee.code === 'CRB' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  CRB Windfall Deal Decision Options
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  6 decision options for deals &gt;$1M ARR, &gt;$100K commission, or &gt;50% quarterly quota
                </p>
                <div className="space-y-3">
                  {CRB_DECISION_OPTIONS.map((option, idx) => (
                    <div
                      key={option.id}
                      className="bg-white rounded-lg border border-purple-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-none w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-700">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{option.name}</h4>
                          <p className="text-sm text-gray-700 mt-1">{option.description}</p>
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-xs font-medium text-gray-600">Rationale</p>
                            <p className="text-xs text-gray-700 mt-1">{option.rationale}</p>
                          </div>
                          <div className="mt-2 p-3 bg-blue-50 rounded">
                            <p className="text-xs font-medium text-blue-900">Example</p>
                            <p className="text-xs text-blue-800 mt-1">{option.example}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCommittee.code === 'SGCC' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">SPIF Approval Thresholds</h3>
                <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-purple-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authority</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">&lt;$50K</td>
                        <td className="px-4 py-3 text-sm text-gray-700">SGCC</td>
                        <td className="px-4 py-3 text-sm text-gray-600">5 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">$50K - $250K</td>
                        <td className="px-4 py-3 text-sm text-gray-700">SGCC + CFO</td>
                        <td className="px-4 py-3 text-sm text-gray-600">10 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">&gt;$250K</td>
                        <td className="px-4 py-3 text-sm text-gray-700">SGCC + CEO</td>
                        <td className="px-4 py-3 text-sm text-gray-600">15 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-500">Select a committee to view details</p>
    </div>
  );

  // Right Detail Pane - Quick actions / context
  const rightDetail = selectedCommittee ? (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-purple-200">
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Link
          href={`/documents/${selectedCommittee.charterDocument}`}
          className="block p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start gap-2">
            <FileTextIcon className="w-4 h-4 text-purple-600 flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">View Charter</p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedCommittee.charterDocument}</p>
            </div>
          </div>
        </Link>

        <button className="w-full p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all text-left">
          <div className="flex items-start gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600 flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Schedule Meeting</p>
              <p className="text-xs text-gray-500 mt-0.5">Create agenda & invite</p>
            </div>
          </div>
        </button>

        <button className="w-full p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all text-left">
          <div className="flex items-start gap-2">
            <ClockIcon className="w-4 h-4 text-orange-600 flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">View Decisions</p>
              <p className="text-xs text-gray-500 mt-0.5">Past decisions log</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex-none p-4 border-t border-purple-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Created {new Date(selectedCommittee.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Governance Committees"
        description="SGCC (7 members) and CRB for windfall deals and exception management"
      />
      <div className="h-full">
        <ThreePaneWorkspace
          leftNav={leftNav}
          centerContent={centerContent}
          rightDetail={rightDetail}
          showRightPane={!!selectedCommittee}
        />
      </div>
    </>
  );
}
