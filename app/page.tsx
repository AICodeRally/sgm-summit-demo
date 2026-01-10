'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import RotatingMetricTile from '@/components/dashboard/RotatingMetricTile';
import { ModeCard } from '@/components/modes/ModeCard';
import { METRIC_GROUPS, getMetricGroupsByMode } from '@/lib/data/metric-registry';
import { OperationalMode } from '@/types/operational-mode';
import { getActiveModule } from '@/lib/config/module-registry';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';

interface HenryScheinData {
  totalPlans: number;
  averageCoverage: number;
  criticalGaps: number;
  riskExposure: number;
  riskMitigation: number;
}

export default function SGMDashboard() {
  const activeModule = getActiveModule();
  const [henryScheinData, setHenryScheinData] = useState<HenryScheinData | null>(null);
  const [metricData, setMetricData] = useState<Record<string, number | string>>({});

  useEffect(() => {
    // Fetch Henry Schein data dynamically
    fetch('/api/henryschein/gap-analysis')
      .then((res) => res.json())
      .then((data) => setHenryScheinData(data))
      .catch((err) => console.error('Failed to load Henry Schein data:', err));

    // Fetch live metrics
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch documents
      const docsRes = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
      const docsData = await docsRes.json();
      const documents = docsData.documents || [];

      // Fetch policies
      const policiesRes = await fetch('/api/sgm/policies?tenantId=demo-tenant-001');
      const policiesData = await policiesRes.json();
      const policies = policiesData.policies || [];

      // Calculate all metrics
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const metrics: Record<string, number | string> = {
        // Document metrics
        totalDocuments: documents.length,
        pendingReview: documents.filter((d: any) => d.status === 'UNDER_REVIEW').length,
        expiringSoon: documents.filter((d: any) => {
          if (!d.expirationDate) return false;
          const expDate = new Date(d.expirationDate);
          return expDate > now && expDate < thirtyDaysFromNow;
        }).length,
        recentUpdates: documents.filter((d: any) => {
          const updated = new Date(d.lastUpdated);
          return updated > sevenDaysAgo;
        }).length,
        needsLegalReview: documents.filter((d: any) => d.legalReviewStatus === 'PENDING').length,

        // Approval metrics
        pendingApprovals: 3, // From synthetic data
        overdueApprovals: 1, // Critical - overdue items
        slaCompliance: 94, // 94% on-time
        avgApprovalTime: 2.3, // 2.3 days average
        completedThisMonth: 12,

        // Case metrics
        activeCases: 4,
        highPriorityCases: 1, // Critical
        approachingSLA: 2, // Warning - approaching deadline
        avgResolution: 3.5, // 3.5 days
        exceptionRequests: 2,

        // Policy metrics
        activePolicies: policies.filter((p: any) => p.status === 'ACTIVE').length,
        needsReview: policies.filter((p: any) => {
          if (!p.nextReview) return false;
          return new Date(p.nextReview) < now;
        }).length,
        complianceScore: 96, // 96% compliance
        updatedThisQuarter: 5,
        auditFindings: 0, // No open findings

        // Governance metrics
        committees: 2,
        upcomingMeetings: 3,
        decisionsThisMonth: 8,
        activeMembers: 12,
        activityScore: 87, // 87% engagement
      };

      setMetricData(metrics);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(2)}M`;
  };

  // Get one metric group per mode for the 4 rotating tiles
  const modeMetrics = [
    getMetricGroupsByMode(OperationalMode.DESIGN)[0],
    getMetricGroupsByMode(OperationalMode.OPERATE)[0],
    getMetricGroupsByMode(OperationalMode.DISPUTE)[0],
    getMetricGroupsByMode(OperationalMode.OVERSEE)[0],
  ].filter(Boolean); // Filter out undefined

  return (
    <>
      <SetPageTitle
        title="Sales Governance Management"
        description="Choose your workflow mode: Design, Operate, Dispute, or Oversee"
      />
      <div className="min-h-screen" style={{ background: `linear-gradient(to bottom right, ${activeModule.gradient.start}10, ${activeModule.gradient.end}15, white)` }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Henry Schein Beta Client Banner */}
          {henryScheinData && (
            <Link href="/client/henryschein">
              <div className="mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-4 border-blue-400 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white text-blue-600 text-sm font-bold rounded-full">
                        BETA CLIENT
                      </span>
                      <span className="text-white text-sm font-medium">
                        Gap Analysis Ready
                      </span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-3">
                      Henry Schein, Inc.
                    </h2>
                    <p className="text-blue-100 text-lg">
                      {henryScheinData.totalPlans} Plans Analyzed | {henryScheinData.averageCoverage}% Avg Coverage | {henryScheinData.criticalGaps} Gaps Identified | {formatCurrency(henryScheinData.riskExposure)} Risk Exposure
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-white font-medium group-hover:gap-4 transition-all">
                      <span className="text-lg">View Gap Analysis Dashboard</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                      <p className="text-blue-100 text-sm mb-2">3-Year ROI</p>
                      <p className="text-5xl font-bold text-white">1,867%</p>
                      <p className="text-blue-100 text-xs mt-2">{formatCurrency(henryScheinData.riskMitigation)} benefit</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Mode Metrics Bar - 4 rotating tiles, one per mode */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {modeMetrics.map((group) => (
              <RotatingMetricTile key={group.id} group={group} metricData={metricData} />
            ))}
          </div>

          {/* 4 Operational Mode Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModeCard mode={OperationalMode.DESIGN} />
            <ModeCard mode={OperationalMode.OPERATE} />
            <ModeCard mode={OperationalMode.DISPUTE} />
            <ModeCard mode={OperationalMode.OVERSEE} />
          </div>
        </div>
      </div>
    </>
  );
}
