'use client';

import React, { useState } from 'react';
import {
  BoxIcon,
  EyeOpenIcon,
  TargetIcon,
  CheckCircledIcon,
  StopwatchIcon,
  ClipboardIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface ComplianceIssue {
  id: string;
  type: 'retention' | 'review' | 'legal' | 'approval' | 'expiration';
  severity: 'critical' | 'warning' | 'info';
  document: string;
  documentCode: string;
  issue: string;
  dueDate: string;
  action: string;
}

export default function CompliancePage() {
  const [issues] = useState<ComplianceIssue[]>([
    {
      id: 'comp-001',
      type: 'review',
      severity: 'critical',
      document: 'Sales Crediting Policy',
      documentCode: 'POL-001',
      issue: 'Document review overdue by 5 days',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Schedule review meeting',
    },
    {
      id: 'comp-002',
      type: 'approval',
      severity: 'warning',
      document: 'SPIF Governance Policy v2.0',
      documentCode: 'POL-004',
      issue: 'Pending approval for 3 days',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Submit for legal review',
    },
    {
      id: 'comp-003',
      type: 'legal',
      severity: 'warning',
      document: 'Clawback Recovery Policy',
      documentCode: 'POL-006',
      issue: 'Awaiting legal review for 10 days',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Follow up with General Counsel',
    },
    {
      id: 'comp-004',
      type: 'expiration',
      severity: 'info',
      document: 'Commission Reconciliation Procedures',
      documentCode: 'PROC-001',
      issue: 'Document expires in 30 days',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Plan renewal',
    },
    {
      id: 'comp-005',
      type: 'retention',
      severity: 'info',
      document: 'Dispute Resolution Procedures v1.0',
      documentCode: 'PROC-002',
      issue: 'Archival document approaching retention limit (2 years)',
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Review for permanent archival',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]',
      warning: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
      info: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]',
    };
    return colors[severity] || 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      retention: BoxIcon,
      review: EyeOpenIcon,
      legal: TargetIcon,
      approval: CheckCircledIcon,
      expiration: StopwatchIcon,
    };
    const Icon = icons[type] || ClipboardIcon;
    return <Icon className="w-5 h-5 text-[color:var(--color-foreground)]" />;
  };

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <>
      <SetPageTitle
        title="Compliance Dashboard"
        description="Monitor regulatory compliance and policy adherence"
      />
      <div className="h-screen sparcc-hero-bg flex flex-col">

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
            <p className="text-sm text-[color:var(--color-muted)] font-medium">Total Issues</p>
            <p className="text-3xl font-bold text-[color:var(--color-foreground)] mt-2">{issues.length}</p>
          </div>
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-error-border)] p-6">
            <p className="text-sm text-[color:var(--color-error)] font-medium">Critical</p>
            <p className="text-3xl font-bold text-[color:var(--color-error)] mt-2">{criticalCount}</p>
          </div>
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-warning-border)] p-6">
            <p className="text-sm text-[color:var(--color-warning)] font-medium">Warnings</p>
            <p className="text-3xl font-bold text-[color:var(--color-warning)] mt-2">{warningCount}</p>
          </div>
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-success-border)] p-6">
            <p className="text-sm text-[color:var(--color-success)] font-medium">Compliant</p>
            <p className="text-3xl font-bold text-[color:var(--color-success)] mt-2">{6 - issues.length}</p>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">Compliance Issues</h2>

          {issues.length === 0 ? (
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-success-border)] p-12 text-center">
              <p className="text-[color:var(--color-success)] text-lg font-medium inline-flex items-center gap-2">
                <CheckCircledIcon className="w-5 h-5" />
                All compliant
              </p>
              <p className="text-[color:var(--color-muted)] mt-2">No compliance issues detected</p>
            </div>
          ) : (
            issues.map(issue => (
              <div key={issue.id} className={`rounded-lg border p-6 ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span>{getTypeIcon(issue.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[color:var(--color-foreground)]">{issue.document}</h3>
                      <p className="text-sm mt-1 opacity-90">{issue.issue}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-medium opacity-75">
                          Due: {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium opacity-75">{issue.documentCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-xs font-medium opacity-75 mb-2">Recommended Action:</p>
                    <button className="px-4 py-2 bg-[color:var(--color-surface)] rounded hover:opacity-90 text-sm font-medium">
                      {issue.action}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compliance Report */}
        <div className="mt-12 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
          <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-6">Compliance Report</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[color:var(--color-surface-alt)] rounded">
              <div>
                <p className="font-medium text-[color:var(--color-foreground)]">Document Review Status</p>
                <p className="text-sm text-[color:var(--color-muted)]">Quarterly reviews required for all active documents</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[color:var(--color-warning)]">83%</p>
                <p className="text-xs text-[color:var(--color-muted)]">5 of 6 current</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[color:var(--color-surface-alt)] rounded">
              <div>
                <p className="font-medium text-[color:var(--color-foreground)]">Approval Compliance</p>
                <p className="text-sm text-[color:var(--color-muted)]">All documents must be formally approved before active</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[color:var(--color-success)]">100%</p>
                <p className="text-xs text-[color:var(--color-muted)]">6 of 6 compliant</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[color:var(--color-surface-alt)] rounded">
              <div>
                <p className="font-medium text-[color:var(--color-foreground)]">Legal Review Status</p>
                <p className="text-sm text-[color:var(--color-muted)]">Policy documents require legal review</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[color:var(--color-warning)]">67%</p>
                <p className="text-xs text-[color:var(--color-muted)]">4 of 6 reviewed</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[color:var(--color-surface-alt)] rounded">
              <div>
                <p className="font-medium text-[color:var(--color-foreground)]">Regulatory Compliance</p>
                <p className="text-sm text-[color:var(--color-muted)]">CA Labor Code, Section 409A, SOX compliance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[color:var(--color-success)]">100%</p>
                <p className="text-xs text-[color:var(--color-muted)]">All policies compliant</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm font-medium">
              Export Report
            </button>
            <button className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm font-medium">
              Email Report
            </button>
          </div>
        </div>
        </div>
      </div>
      </div>
    </>
  );
}
