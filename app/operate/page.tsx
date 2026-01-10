'use client';

import React, { useEffect, useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeHeader } from '@/components/modes/ModeHeader';
import { FeatureTile } from '@/components/modes/FeatureTile';
import { Breadcrumb } from '@/components/Breadcrumb';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import {
  FileTextIcon,
  ClipboardIcon,
  CheckCircledIcon,
  CalendarIcon,
  BarChartIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';

export default function OperateModePage() {
  const config = MODE_CONFIGS[OperationalMode.OPERATE];
  const [metrics, setMetrics] = useState({
    documents: 0,
    pendingApprovals: 0,
    activePlans: 0,
    notifications: 0,
  });

  useEffect(() => {
    // Fetch metrics
    const fetchMetrics = async () => {
      try {
        const docsRes = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
        const docsData = await docsRes.json();
        setMetrics((prev) => ({
          ...prev,
          documents: docsData.documents?.length || 0,
          pendingApprovals: 3,
          activePlans: 12,
          notifications: 5,
        }));
      } catch (err) {
        console.error('Failed to load metrics:', err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <>
      <SetPageTitle
        title="Operate Mode"
        description="Execute day-to-day compensation operations"
      />
      <div
        className="min-h-screen bg-gradient-to-br"
        style={{
          background: `linear-gradient(to bottom right, ${config.color.hex}15, ${config.color.hex}30)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ModeHeader mode={OperationalMode.OPERATE} />

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.documents}</p>
              <p className="text-sm text-gray-600 mt-2">Documents</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.pendingApprovals}</p>
              <p className="text-sm text-gray-600 mt-2">Pending Approvals</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.activePlans}</p>
              <p className="text-sm text-gray-600 mt-2">Active Plans</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.notifications}</p>
              <p className="text-sm text-gray-600 mt-2">Notifications</p>
            </div>
          </div>

          {/* Primary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Primary Features</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureTile
                href="/documents"
                label="Document Library"
                description="48 governance documents with versioning and lifecycle management"
                icon={<FileTextIcon className="w-10 h-10" />}
                count={metrics.documents}
                primary
              />
              <FeatureTile
                href="/plans"
                label="Plans Management"
                description="Create, review, and modify compensation plans"
                icon={<ClipboardIcon className="w-10 h-10" />}
                count={metrics.activePlans}
                primary
              />
              <FeatureTile
                href="/approvals"
                label="Approvals Queue"
                description="SGCC and CRB workflows with SLA tracking"
                icon={<CheckCircledIcon className="w-10 h-10" />}
                count={metrics.pendingApprovals}
                primary
              />
            </div>
          </div>

          {/* Secondary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tools & Utilities</h2>
            <div className="grid grid-cols-4 gap-6">
              <FeatureTile
                href="/calendar"
                label="Calendar"
                description="Schedule and track important dates"
                icon={<CalendarIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/reports"
                label="Reports"
                description="Generate governance reports"
                icon={<BarChartIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/compare"
                label="Search & Compare"
                description="Compare documents and plans"
                icon={<MagnifyingGlassIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/notifications"
                label="Notifications"
                description="Stay updated on important events"
                icon={<BellIcon className="w-8 h-8" />}
                count={metrics.notifications}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
