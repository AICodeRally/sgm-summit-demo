'use client';

import React, { useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeHeader } from '@/components/modes/ModeHeader';
import { FeatureTile } from '@/components/modes/FeatureTile';
import { Breadcrumb } from '@/components/Breadcrumb';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import {
  AvatarIcon,
  ClockIcon,
  BarChartIcon,
  CheckCircledIcon,
  FileTextIcon,
  DashboardIcon,
} from '@radix-ui/react-icons';

export default function OverseeModePage() {
  const config = MODE_CONFIGS[OperationalMode.OVERSEE];
  const [metrics] = useState({
    committees: 2,
    upcomingMeetings: 3,
    decisionsThisMonth: 8,
    activeMembers: 12,
    complianceScore: 96,
  });

  return (
    <>
      <SetPageTitle
        title="Oversee Mode"
        description="Executive oversight, governance, and compliance"
      />
      <div
        className="min-h-screen bg-gradient-to-br"
        style={{
          background: `linear-gradient(to bottom right, ${config.color.hex}15, ${config.color.hex}30)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ModeHeader mode={OperationalMode.OVERSEE} />

          {/* Key Metrics */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.committees}</p>
              <p className="text-sm text-gray-600 mt-2">Committees</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.upcomingMeetings}</p>
              <p className="text-sm text-gray-600 mt-2">Meetings</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.decisionsThisMonth}</p>
              <p className="text-sm text-gray-600 mt-2">Decisions</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.activeMembers}</p>
              <p className="text-sm text-gray-600 mt-2">Members</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.complianceScore}%</p>
              <p className="text-sm text-gray-600 mt-2">Compliance</p>
            </div>
          </div>

          {/* Primary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Primary Features</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureTile
                href="/committees"
                label="Committee Management"
                description="SGCC and CRB with 7 members, meeting management, and decision tracking"
                icon={<AvatarIcon className="w-10 h-10" />}
                count={metrics.committees}
                primary
              />
              <FeatureTile
                href="/audit"
                label="Audit Timeline"
                description="Comprehensive event history, compliance tracking, and audit trails"
                icon={<ClockIcon className="w-10 h-10" />}
                primary
              />
              <FeatureTile
                href="/analytics"
                label="Governance Analytics"
                description="Executive dashboards, KPIs, governance health metrics and trends"
                icon={<BarChartIcon className="w-10 h-10" />}
                primary
              />
            </div>
          </div>

          {/* Secondary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oversight Tools</h2>
            <div className="grid grid-cols-4 gap-6">
              <FeatureTile
                href="/committees/decisions"
                label="Decisions Log"
                description="Committee decisions and resolutions"
                icon={<CheckCircledIcon className="w-8 h-8" />}
                count={metrics.decisionsThisMonth}
              />
              <FeatureTile
                href="/governance-matrix"
                label="Compliance Monitor"
                description="Policy coverage and compliance status"
                icon={<FileTextIcon className="w-8 h-8" />}
                count={`${metrics.complianceScore}%`}
              />
              <FeatureTile
                href="/henryschein"
                label="Client Dashboards"
                description="Henry Schein gap analysis (template)"
                icon={<DashboardIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/analytics?view=risk"
                label="Risk Assessment"
                description="Governance risk scoring and mitigation"
                icon={<BarChartIcon className="w-8 h-8" />}
              />
            </div>
          </div>

          {/* Committee Overview */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 p-6 mb-8" style={{ borderColor: `${config.color.hex}30` }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Committees</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6" style={{ borderColor: `${config.color.hex}30` }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">
                    Sales Governance Compliance Committee (SGCC)
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Members:</strong> 7</p>
                  <p><strong>Next Meeting:</strong> In 5 days</p>
                  <p><strong>Decisions This Month:</strong> {metrics.decisionsThisMonth}</p>
                  <p><strong>Responsibilities:</strong> Policy approval, compliance oversight, exception review</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: `${config.color.hex}30` }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">
                    Compensation Review Board (CRB)
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Members:</strong> 5</p>
                  <p><strong>Next Meeting:</strong> In 12 days</p>
                  <p><strong>Focus:</strong> Windfall deals</p>
                  <p><strong>Responsibilities:</strong> Exception approvals, special case reviews, policy recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
