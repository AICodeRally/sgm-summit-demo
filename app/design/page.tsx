'use client';

import React, { useEffect, useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeHeader } from '@/components/modes/ModeHeader';
import { FeatureTile } from '@/components/modes/FeatureTile';
import { Breadcrumb } from '@/components/Breadcrumb';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import {
  ReaderIcon,
  FileTextIcon,
  BookmarkIcon,
  TableIcon,
  Link2Icon,
  ArchiveIcon,
} from '@radix-ui/react-icons';

export default function DesignModePage() {
  const config = MODE_CONFIGS[OperationalMode.DESIGN];
  const [metrics, setMetrics] = useState({
    policies: 26,
    templates: 56,
    frameworks: 6,
    planCount: 27,
  });

  return (
    <>
      <SetPageTitle
        title="Design Mode"
        description="Build compensation frameworks, policies, and templates"
      />
      <div
        className="min-h-screen bg-gradient-to-br"
        style={{
          background: `linear-gradient(to bottom right, ${config.color.hex}15, ${config.color.hex}30)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ModeHeader mode={OperationalMode.DESIGN} />

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.policies}</p>
              <p className="text-sm text-gray-600 mt-2">Policies</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.templates}</p>
              <p className="text-sm text-gray-600 mt-2">Template Sections</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.frameworks}</p>
              <p className="text-sm text-gray-600 mt-2">Frameworks</p>
            </div>
            <div className="bg-white rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.planCount}</p>
              <p className="text-sm text-gray-600 mt-2">Plans Analyzed</p>
            </div>
          </div>

          {/* Primary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Primary Features</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureTile
                href="/policies"
                label="Policy Library"
                description="26 governance policies with templates and best practices"
                icon={<ReaderIcon className="w-10 h-10" />}
                count={metrics.policies}
                primary
              />
              <FeatureTile
                href="/templates"
                label="Plan Templates"
                description="Build custom compensation plan templates with 56 sections"
                icon={<FileTextIcon className="w-10 h-10" />}
                count={metrics.templates}
                primary
              />
              <FeatureTile
                href="/governance-framework"
                label="Frameworks"
                description="6 governance pillars with 25 policies and compliance mapping"
                icon={<BookmarkIcon className="w-10 h-10" />}
                count={metrics.frameworks}
                primary
              />
            </div>
          </div>

          {/* Secondary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis & Tools</h2>
            <div className="grid grid-cols-4 gap-6">
              <FeatureTile
                href="/governance-matrix"
                label="Governance Matrix"
                description="Policy coverage and approval authorities"
                icon={<TableIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/henryschein/plans"
                label="Gap Analysis"
                description="Policy coverage and risk scoring"
                icon={<span className="text-3xl">📊</span>}
                count={metrics.planCount}
              />
              <FeatureTile
                href="/framework/primer"
                label="Framework Primer"
                description="Learn the governance framework"
                icon={<BookmarkIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/links"
                label="Document Links"
                description="Policy and document relationships"
                icon={<Link2Icon className="w-8 h-8" />}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
