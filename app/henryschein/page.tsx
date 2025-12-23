'use client';

import Link from 'next/link';
import {
  FileTextIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ArrowRightIcon,
  BarChartIcon,
  ClockIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

interface GapAnalysis {
  totalPlans: number;
  averageCoverage: number;
  criticalGaps: number;
  mustHavePolicies: number;
  riskExposure: number;
  riskMitigation: number;
}

export default function HenryScheinDashboard() {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load gap analysis data from real API
    fetch('/api/henryschein/gap-analysis')
      .then((res) => res.json())
      .then((data) => setAnalysis(data))
      .catch((err) => {
        console.error('Failed to load gap analysis data:', err);
        setAnalysis(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(2)}M`;
  };

  const getCoverageColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBg = (pct: number) => {
    if (pct >= 80) return 'bg-green-50 border-green-200';
    if (pct >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        <p className="text-gray-600">Loading Henry Schein dashboard...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-bold text-xl mb-2">Failed to load data</p>
          <p className="text-gray-600">Could not connect to gap analysis API</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Hero Section - Henry Schein Branded */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold" style={{ color: '#005EB8' }}>
                  Henry Schein
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  BETA CLIENT
                </span>
              </div>
              <p className="text-xl text-gray-700 mt-2">
                Compensation Governance Gap Analysis & Implementation Dashboard
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Provided by</p>
              <p className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
                Blue Horizons Group
              </p>
              <p className="text-xs text-gray-500">December 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Critical Alert Banner */}
        <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md">
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">
                CRITICAL: {analysis.criticalGaps} Policy Gaps Identified
              </h3>
              <p className="text-red-800 mt-2">
                {formatCurrency(analysis.riskExposure)} annual risk exposure across {analysis.totalPlans} compensation plans.
                {' '}{analysis.mustHavePolicies} MUST HAVE policies ready for Q1 2026 implementation.
              </p>
              <div className="mt-4 flex gap-4">
                <Link
                  href="/henryschein/gaps"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all font-medium"
                >
                  View All Gaps →
                </Link>
                <Link
                  href="/henryschein/policies"
                  className="px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-all font-medium"
                >
                  Review DRAFT Policies
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Average Coverage */}
          <div className={`rounded-lg border-2 p-6 shadow-md ${getCoverageBg(analysis.averageCoverage)}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Average Policy Coverage</p>
              <BarChartIcon className="w-5 h-5 text-gray-600" />
            </div>
            <p className={`text-4xl font-bold ${getCoverageColor(analysis.averageCoverage)}`}>
              {analysis.averageCoverage}%
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {analysis.averageCoverage >= 80 ? '✓ Good' : analysis.averageCoverage >= 60 ? '⚠ Fair' : '✗ Needs Improvement'}
            </p>
          </div>

          {/* Plans Analyzed */}
          <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Plans Analyzed</p>
              <FileTextIcon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-blue-600">{analysis.totalPlans}</p>
            <p className="text-xs text-gray-600 mt-2">Across 4 divisions</p>
          </div>

          {/* Risk Exposure */}
          <div className="bg-white rounded-lg border-2 border-red-200 p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Risk Exposure</p>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-4xl font-bold text-red-600">
              {formatCurrency(analysis.riskExposure)}
            </p>
            <p className="text-xs text-gray-600 mt-2">Annual exposure</p>
          </div>

          {/* Risk Mitigation Potential */}
          <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Mitigation Potential</p>
              <CheckCircledIcon className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-4xl font-bold text-green-600">
              {formatCurrency(analysis.riskMitigation)}
            </p>
            <p className="text-xs text-gray-600 mt-2">With 6 BHG policies</p>
          </div>
        </div>

        {/* ROI Highlight */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-8 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 uppercase tracking-wider">
                3-Year ROI Projection
              </p>
              <p className="text-6xl font-bold mt-2">1,867%</p>
              <p className="text-lg mt-2 text-green-100">
                ${formatCurrency(analysis.riskMitigation)} benefit / $150K implementation cost
              </p>
            </div>
            <div className="text-right">
              <RocketIcon className="w-20 h-20 text-green-100 mb-4" />
              <p className="text-sm text-green-100">Implementation Ready</p>
            </div>
          </div>
        </div>

        {/* Main Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Policy Coverage Matrix */}
          <Link href="/henryschein/coverage">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChartIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Policy Coverage Matrix</h2>
              </div>
              <p className="text-gray-600 mb-4">
                27×16 interactive matrix showing FULL/LIMITED/NO coverage for each plan and policy area
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
                View Matrix <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Plan Details */}
          <Link href="/henryschein/plans">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Plan-by-Plan Analysis</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Detailed breakdown of coverage, gaps, and priorities for all 27 compensation plans
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                View Plans <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* BHG DRAFT Policies */}
          <Link href="/henryschein/policies">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircledIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">6 BHG DRAFT Policies</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Review and prioritize policies: Windfall, 409A, State Wage Law, Clawback, Quota, SPIF
              </p>
              <div className="flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all">
                Review Policies <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Gap Analysis */}
          <Link href="/henryschein/gaps">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-red-300 transition-all cursor-pointer h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">408 Critical Gaps</h2>
              </div>
              <p className="text-gray-600 mb-4">
                NO and LIMITED policy coverage items with priority rankings and BHG policy mapping
              </p>
              <div className="flex items-center gap-2 text-red-600 font-medium group-hover:gap-3 transition-all">
                View All Gaps <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Implementation Roadmap */}
          <Link href="/henryschein/roadmap">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Q1 2026 Roadmap</h2>
              </div>
              <p className="text-gray-600 mb-4">
                12-week implementation plan: policy finalization, CRB establishment, training, go-live
              </p>
              <div className="flex items-center gap-2 text-green-600 font-medium group-hover:gap-3 transition-all">
                View Roadmap <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Documents Library */}
          <Link href="/documents">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileTextIcon className="w-6 h-6 text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">90 Deliverables</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Complete BHG delivery package: frameworks, policies, procedures, templates, assessments
              </p>
              <div className="flex items-center gap-2 text-gray-600 font-medium group-hover:gap-3 transition-all">
                Browse Library <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <p className="text-sm font-medium text-gray-900 flex-1">
                Schedule Legal Review of Section 409A Compliance Policy (DRAFT)
              </p>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                URGENT
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <p className="text-sm font-medium text-gray-900 flex-1">
                Establish Compensation Review Board (CRB) for windfall deal approvals
              </p>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                URGENT
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <p className="text-sm font-medium text-gray-900 flex-1">
                Review Policy Coverage Matrix with Compensation Committee
              </p>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                THIS WEEK
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-sm font-medium text-gray-900 flex-1">
                Begin Q1 2026 implementation planning (12-week timeline)
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                NEXT WEEK
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Henry Schein Gap Analysis Package • Generated December 22, 2025 • Project ID: HS-2025-001</p>
          <p className="mt-1">
            Questions? Contact{' '}
            <a href="mailto:consulting@bluehorizonsgroup.com" className="text-blue-600 hover:underline">
              Blue Horizons Group
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
