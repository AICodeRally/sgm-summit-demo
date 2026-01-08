'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  BookmarkIcon,
  CheckCircledIcon,
  FileTextIcon,
  BarChartIcon,
  GearIcon,
  RocketIcon,
  LockClosedIcon,
  LightningBoltIcon,
  MixIcon,
  PersonIcon,
  CalendarIcon,
  ArchiveIcon,
  StarIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';

export default function GovernanceFrameworkHome() {
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);

  const policyCategories = [
    {
      category: 'Foundational Policies',
      shortName: 'Foundation',
      description: 'Core governance and legal framework',
      color: 'from-slate-600 to-gray-600',
      lightColor: 'from-slate-100 to-gray-100',
      accentColor: 'slate-600',
      policies: [
        { id: 1, name: 'Definition of Terms', icon: FileTextIcon, description: 'List of defined words, terms and performance measures' },
        { id: 2, name: 'Effective Date of Plan', icon: CalendarIcon, description: 'Date and time period when plan is active' },
        { id: 3, name: 'Eligibility', icon: PersonIcon, description: 'Which roles are eligible for the sales incentive plan' },
        { id: 4, name: 'Plan Confidentiality', icon: LockClosedIcon, description: 'Confidentiality agreement for plan details' },
        { id: 5, name: 'No Employment Agreement', icon: ExclamationTriangleIcon, description: 'Plan participation does not guarantee employment' },
        { id: 6, name: 'Right to Amend Plan', icon: UpdateIcon, description: 'Management authority to modify plan terms' },
        { id: 7, name: 'Dispute Resolution', icon: GearIcon, description: 'Procedure for resolving compensation disputes' },
        { id: 8, name: 'Compensation Review Board', icon: PersonIcon, description: 'Governance team for plan decisions and exceptions' },
      ],
    },
    {
      category: 'Plan Policies',
      shortName: 'Plan Design',
      description: 'Compensation structure and mechanics',
      color: 'from-blue-600 to-indigo-600',
      lightColor: 'from-blue-100 to-indigo-100',
      accentColor: 'blue-600',
      policies: [
        { id: 9, name: 'Base Salary and Incentive', icon: BarChartIcon, description: 'Components of total compensation' },
        { id: 10, name: 'Measure Description & Source', icon: CheckCircledIcon, description: 'Performance measures and tracking methods' },
        { id: 11, name: 'Payment Timing', icon: CalendarIcon, description: 'When and how payments are made' },
        { id: 12, name: 'Draws', icon: ArchiveIcon, description: 'Recoverable and non-recoverable advance payments' },
        { id: 13, name: 'Windfalls', icon: LightningBoltIcon, description: 'Treatment of unusually large commission events' },
      ],
    },
    {
      category: 'Crediting Policies',
      shortName: 'Crediting',
      description: 'Sales credit allocation rules',
      color: 'from-green-600 to-emerald-600',
      lightColor: 'from-green-100 to-emerald-100',
      accentColor: 'green-600',
      policies: [
        { id: 14, name: 'Incentive Earned', icon: CheckCircledIcon, description: 'When incentives are legally earned' },
        { id: 15, name: 'Sale Reductions (Clawbacks)', icon: ArchiveIcon, description: 'Handling cancellations, chargebacks, unpaid bills' },
        { id: 16, name: 'Split Credit Guidelines', icon: MixIcon, description: 'Credit allocation for multi-seller scenarios' },
      ],
    },
    {
      category: 'HR Policies',
      shortName: 'HR Events',
      description: 'Employment lifecycle management',
      color: 'from-purple-600 to-fuchsia-600',
      lightColor: 'from-purple-100 to-fuchsia-100',
      accentColor: 'purple-600',
      policies: [
        { id: 17, name: 'New Hires', icon: RocketIcon, description: 'Ramp period compensation for new employees' },
        { id: 18, name: 'Transfer and Promotion', icon: UpdateIcon, description: 'Mid-period role changes and quota assignments' },
        { id: 19, name: 'Termination', icon: ExclamationTriangleIcon, description: 'Final commission payment upon termination' },
        { id: 20, name: 'Leave of Absence', icon: PersonIcon, description: 'Incentive treatment during LOA' },
      ],
    },
    {
      category: 'Territory and Quota Policies',
      shortName: 'Territory',
      description: 'Territory and quota governance',
      color: 'from-orange-600 to-red-600',
      lightColor: 'from-orange-100 to-red-100',
      accentColor: 'orange-600',
      policies: [
        { id: 21, name: 'Territory / Account Changes', icon: MixIcon, description: 'Impact of territory changes on incentives' },
        { id: 22, name: 'Quota Setting', icon: BarChartIcon, description: 'Process, methodology, and accountabilities' },
        { id: 23, name: 'Quota Adjustments', icon: UpdateIcon, description: 'When and how quotas are modified' },
      ],
    },
    {
      category: 'Other Reward Policies',
      shortName: 'Rewards',
      description: 'Additional incentive programs',
      color: 'from-yellow-600 to-amber-600',
      lightColor: 'from-yellow-100 to-amber-100',
      accentColor: 'yellow-600',
      policies: [
        { id: 24, name: 'SPIFFs', icon: StarIcon, description: 'Short-term performance incentives' },
        { id: 25, name: 'Recognition Program', icon: StarIcon, description: 'Non-cash awards and honors' },
      ],
    },
  ];

  const frameworkDocs = [
    { name: 'Governance Committee Charter', description: 'SGCC structure and decision authority', icon: PersonIcon },
    { name: 'Comp Review Board Charter', description: 'CRB for windfall deals and exceptions', icon: CheckCircledIcon },
    { name: 'Access Controls Framework', description: 'Role-based permissions matrix', icon: LockClosedIcon },
    { name: 'Segregation of Duties Matrix', description: 'SOD controls for plan administration', icon: GearIcon },
    { name: 'Stakeholder Communication Framework', description: 'Change management protocols', icon: BookmarkIcon },
    { name: 'Standard Taxonomy Dictionary', description: 'Common definitions and terminology', icon: FileTextIcon },
    { name: 'Plan Document Template', description: 'Standard comp plan document structure', icon: FileTextIcon },
  ];

  const togglePillar = (index: number) => {
    setExpandedPillar(expandedPillar === index ? null : index);
  };

  return (
    <>
      <SetPageTitle
        title="BHG Governance Framework"
        description="25 policy areas organized into 6 pillars for comprehensive compensation governance"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        {/* Quick Action Buttons */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-center gap-4">
              <Link
                href="/framework/primer"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg font-semibold"
              >
                📖 Framework Primer
              </Link>
              <Link
                href="/framework/primer"
                className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold"
              >
                📊 Run Assessment
              </Link>
              <Link
                href="/framework/primer"
                className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold"
              >
                ⚙️ Customize Framework
              </Link>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Pillar Diagram */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">The 6 Pillars of Compensation Governance</h2>
            <p className="text-gray-600 mt-2">
              Click any pillar to explore the policies within
            </p>
          </div>

          {/* Architectural Pillar Diagram */}
          <div className="relative">
            {/* Foundation Base */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-t-sm shadow-lg" />
            <div className="absolute -bottom-2 left-0 right-0 h-6 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 rounded-sm shadow-xl" />

            {/* Pillars Container */}
            <div className="grid grid-cols-6 gap-4 mb-8 relative z-10">
              {policyCategories.map((category, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {/* Pillar */}
                  <div
                    onClick={() => togglePillar(idx)}
                    className="relative w-full cursor-pointer group"
                  >
                    {/* Capital (Top) */}
                    <div className={`bg-gradient-to-r ${category.color} h-8 rounded-t-lg shadow-md transform group-hover:scale-105 transition-transform relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10" />
                      {/* Policy Count Badge */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white">
                        <span className={`text-xl font-bold text-${category.accentColor}`}>{category.policies.length}</span>
                      </div>
                    </div>

                    {/* Pillar Shaft */}
                    <div className={`bg-gradient-to-b ${category.color} h-64 shadow-xl relative overflow-hidden group-hover:shadow-2xl transition-shadow`}>
                      {/* Vertical lines for texture */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="h-full w-1 bg-white absolute left-1/4" />
                        <div className="h-full w-1 bg-white absolute right-1/4" />
                        <div className="h-full w-1 bg-black/20 absolute left-1/3" />
                        <div className="h-full w-1 bg-black/20 absolute right-1/3" />
                      </div>

                      {/* Pillar Text (Vertical) */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="transform -rotate-90 whitespace-nowrap">
                          <h3 className="text-white font-bold text-lg tracking-wide uppercase">
                            {category.shortName}
                          </h3>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                    </div>

                    {/* Base (Bottom) */}
                    <div className={`bg-gradient-to-b ${category.color} h-6 rounded-b-lg shadow-md relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="mt-3 flex justify-center">
                      {expandedPillar === idx ? (
                        <ChevronUpIcon className="w-6 h-6 text-gray-600 animate-bounce" />
                      ) : (
                        <ChevronDownIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Category Name Below */}
                  <div className="mt-2 text-center px-2">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">
                      {category.category}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded Policy Details */}
            {expandedPillar !== null && (
              <div className="mt-8 bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-purple-200 animate-in slide-in-from-top duration-300">
                <div className={`bg-gradient-to-r ${policyCategories[expandedPillar].color} px-6 py-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{policyCategories[expandedPillar].category}</h3>
                      <p className="text-white/90 text-sm mt-1">{policyCategories[expandedPillar].description}</p>
                    </div>
                    <button
                      onClick={() => setExpandedPillar(null)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-semibold transition-colors"
                    >
                      Close ✕
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {policyCategories[expandedPillar].policies.map((policy) => {
                      const Icon = policy.icon;
                      return (
                        <Link key={policy.id} href={`/framework/policies/${policy.id}` as any}>
                          <div className="bg-gray-50 rounded-lg border border-purple-200 p-4 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-white group-hover:bg-purple-50 transition-colors">
                                <Icon className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-gray-400">#{policy.id}</span>
                                  <h4 className="text-sm font-bold text-gray-900">{policy.name}</h4>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{policy.description}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Framework Documents */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Framework Documents</h2>
            <p className="text-gray-600 mt-2">
              Core governance documents - charters, matrices, and templates
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {frameworkDocs.map((doc, idx) => {
              const Icon = doc.icon;
              return (
                <Link key={idx} href={`/framework/documents/${idx + 1}` as any}>
                  <div className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        <Icon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{doc.name}</h3>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Consultant vs Client Tools */}
        <div className="grid grid-cols-2 gap-6">
          {/* Consultant Tools */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">👔 Consultant Tools</h3>
            <p className="text-blue-100 mb-6">
              Run governance assessments and deliver gap analysis reports
            </p>
            <div className="space-y-3">
              <Link
                href={"/framework/primer" as any}
                className="block bg-white text-blue-600 rounded-lg px-4 py-3 hover:bg-blue-50 transition-all font-semibold"
              >
                📊 Plan Assessment Tool
              </Link>
              <Link
                href={"/framework/primer" as any}
                className="block bg-white text-blue-600 rounded-lg px-4 py-3 hover:bg-blue-50 transition-all font-semibold"
              >
                📉 Gap Analysis Report
              </Link>
              <Link
                href={"/framework/primer" as any}
                className="block bg-white text-blue-600 rounded-lg px-4 py-3 hover:bg-blue-50 transition-all font-semibold"
              >
                📦 Deliverables Generator
              </Link>
            </div>
          </div>

          {/* Client Tools */}
          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🏢 Client Tools</h3>
            <p className="text-purple-100 mb-6">
              Manage ongoing governance and policy compliance
            </p>
            <div className="space-y-3">
              <Link
                href={"/framework/primer" as any}
                className="block bg-white text-purple-600 rounded-lg px-4 py-3 hover:bg-purple-50 transition-all font-semibold"
              >
                ⚙️ Customize Framework
              </Link>
              <Link
                href={"/framework/primer" as any}
                className="block bg-white text-purple-600 rounded-lg px-4 py-3 hover:bg-purple-50 transition-all font-semibold"
              >
                📄 Policy Templates
              </Link>
              <Link
                href={"/framework/primer" as any}
                className="block bg-white text-purple-600 rounded-lg px-4 py-3 hover:bg-purple-50 transition-all font-semibold"
              >
                ✅ Compliance Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
