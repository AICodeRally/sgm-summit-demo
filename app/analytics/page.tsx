'use client';

import React from 'react';
import {
  BarChartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DashIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  ClockIcon,
  CalendarIcon,
  LayersIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  GOVERNANCE_KPIS,
  APPROVAL_VELOCITY_TREND,
  CASE_VOLUME_BY_TYPE,
  SLA_COMPLIANCE_BY_MODULE,
  RISK_DISTRIBUTION,
  POLICY_COVERAGE_HEALTH,
  APPROVAL_DECISIONS,
  TOP_PERFORMERS,
  RECENT_HIGHLIGHTS,
  MetricData,
} from '@/lib/data/synthetic/analytics.data';

export default function AnalyticsPage() {
  // Get trend icon
  const getTrendIcon = (trend: MetricData['trend']) => {
    switch (trend) {
      case 'up':
        return ArrowUpIcon;
      case 'down':
        return ArrowDownIcon;
      default:
        return DashIcon;
    }
  };

  // Get trend color
  const getTrendColor = (status: MetricData['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: MetricData['status']) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <SetPageTitle
        title="Analytics Dashboard"
        description="Governance health metrics, trends, and KPIs"
      />
      <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
        {/* Status Bar */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-end">
              <span className="text-xs font-semibold tracking-wider uppercase text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                Last Updated: Just Now
              </span>
            </div>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Performance Indicators */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-purple-600" />
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {GOVERNANCE_KPIS.map((kpi, index) => {
              const TrendIcon = getTrendIcon(kpi.trend);
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(kpi.status)}`}>
                      {kpi.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {kpi.value}
                      <span className="text-lg text-gray-500 ml-1">{kpi.unit}</span>
                    </p>
                  </div>
                  {kpi.trend !== 'neutral' && (
                    <div className={`flex items-center gap-1 text-sm ${getTrendColor(kpi.status)}`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="font-medium">{kpi.trendValue}%</span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Approval Velocity Trend */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChartIcon className="w-4 h-4 text-purple-600" />
              Approval Volume (Last 6 Months)
            </h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {APPROVAL_VELOCITY_TREND.map((point, index) => {
                const maxValue = Math.max(...APPROVAL_VELOCITY_TREND.map(p => p.value));
                const heightPercent = (point.value / maxValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t transition-all hover:from-purple-600 hover:to-fuchsia-600 relative group"
                      style={{ height: `${heightPercent}%` }}>
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-gray-900">{point.value}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case Volume by Type */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayersIcon className="w-4 h-4 text-purple-600" />
              Case Volume by Type
            </h3>
            <div className="space-y-3">
              {CASE_VOLUME_BY_TYPE.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Compliance by Module */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-purple-600" />
              SLA Compliance by Module
            </h3>
            <div className="space-y-3">
              {SLA_COMPLIANCE_BY_MODULE.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.percentage >= 95 ? '#10b981' : item.percentage >= 90 ? '#eab308' : '#dc2626',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-purple-600" />
              Risk Distribution
            </h3>
            <div className="space-y-3">
              {RISK_DISTRIBUTION.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count} policies</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Policy Coverage + Top Performers */}
        <div className="grid grid-cols-3 gap-6">
          {/* Policy Coverage Health */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-purple-600" />
              Policy Coverage
            </h3>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {POLICY_COVERAGE_HEALTH.coveragePercentage}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Full Coverage</span>
                <span className="font-bold text-green-600">{POLICY_COVERAGE_HEALTH.fullCoverage}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Coverage Gaps</span>
                <span className="font-bold text-red-600">{POLICY_COVERAGE_HEALTH.gaps}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Policies</span>
                <span className="font-bold text-gray-900">{POLICY_COVERAGE_HEALTH.total}</span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="col-span-2 bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PersonIcon className="w-4 h-4 text-purple-600" />
              Top Performers (Most Active Reviewers)
            </h3>
            <div className="space-y-3">
              {TOP_PERFORMERS.map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-purple-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{performer.name}</p>
                      <p className="text-xs text-gray-600">{performer.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{performer.decisions} decisions</p>
                    <p className="text-xs text-gray-600">{performer.avgDays} days avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Highlights */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-600" />
            Recent Highlights
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {RECENT_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight.id}
                className={`p-4 rounded-md border-l-4 ${
                  highlight.type === 'success' ? 'bg-green-50 border-green-500' :
                  highlight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900">{highlight.title}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(highlight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
      </div>
    </>
  );
}
