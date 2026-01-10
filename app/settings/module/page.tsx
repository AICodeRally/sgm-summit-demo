'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SetPageTitle } from '@/components/SetPageTitle';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ModuleSwitcher } from '@/components/settings/ModuleSwitcher';
import { getActiveModule, getAllModules } from '@/lib/config/module-registry';
import {
  CubeIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';

export default function ModuleSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [moduleConfig, setModuleConfig] = useState<any>(null);

  useEffect(() => {
    // For demo: Skip auth checks
    // In production, uncomment these checks:
    // if (status === 'loading') return;
    // if (!session?.user) {
    //   router.push('/api/auth/signin');
    //   return;
    // }
    // if (session.user.role !== 'SUPER_ADMIN') {
    //   router.push('/');
    //   return;
    // }

    // Fetch module configuration
    fetchModuleConfig();
  }, [session, status, router]);

  const fetchModuleConfig = async () => {
    try {
      const response = await fetch('/api/settings/module');
      if (!response.ok) {
        throw new Error('Failed to fetch module config');
      }
      const data = await response.json();
      setModuleConfig(data);
    } catch (error) {
      console.error('Error fetching module config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <ReloadIcon className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading module settings...</span>
        </div>
      </div>
    );
  }

  // For demo: Skip permission check
  // In production, uncomment this:
  // if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
  //   return null;
  // }

  const activeModule = getActiveModule();
  const allModules = getAllModules();

  return (
    <>
      <SetPageTitle
        title="Module Settings"
        description="Configure SPARCC module and color schemes"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb
            items={[
              { label: 'Settings' },
              { label: 'Module Configuration' },
            ]}
            className="mb-4"
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <CubeIcon className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">
                Module Configuration
              </h1>
            </div>
            <p className="text-gray-600">
              Manage SPARCC modules and switch between different product lines
            </p>
          </div>

          {/* Module Switcher Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Active Module Switcher
                </h2>
                <p className="text-gray-600 mb-6">
                  Switch between different SPARCC product modules. Changes will
                  reload the page to apply new color schemes and configurations.
                </p>
              </div>
              <ModuleSwitcher />
            </div>
          </div>

          {/* Active Module Details */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Current Module Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Module Info */}
              <div>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Module ID</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {activeModule.module.id}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Product Line</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {activeModule.module.productLine}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Module Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {activeModule.module.name}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Version</p>
                  <p className="text-lg font-mono text-gray-900">
                    v{activeModule.module.version}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Tagline</p>
                  <p className="text-lg italic text-gray-700">
                    {activeModule.module.tagline}
                  </p>
                </div>
              </div>

              {/* Right Column: Gradient Preview */}
              <div>
                <p className="text-sm text-gray-600 mb-3">Color Gradient</p>
                <div
                  className={`h-48 rounded-xl bg-gradient-to-br ${activeModule.gradient.tailwindClass} shadow-lg mb-4`}
                />

                {/* Color Stops */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: activeModule.gradient.start }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Start</p>
                      <p className="text-xs font-mono text-gray-600">
                        {activeModule.gradient.start}
                      </p>
                    </div>
                  </div>

                  {activeModule.gradient.mid1 && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: activeModule.gradient.mid1 }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mid 1</p>
                        <p className="text-xs font-mono text-gray-600">
                          {activeModule.gradient.mid1}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModule.gradient.mid2 && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: activeModule.gradient.mid2 }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mid 2</p>
                        <p className="text-xs font-mono text-gray-600">
                          {activeModule.gradient.mid2}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModule.gradient.mid3 && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: activeModule.gradient.mid3 }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mid 3</p>
                        <p className="text-xs font-mono text-gray-600">
                          {activeModule.gradient.mid3}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: activeModule.gradient.end }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">End</p>
                      <p className="text-xs font-mono text-gray-600">
                        {activeModule.gradient.end}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Colors */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Mode Color Distribution
            </h2>
            <p className="text-gray-600 mb-6">
              Colors automatically distributed from gradient to 4 operational modes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(activeModule.modeColors).map(([mode, color]) => (
                <div
                  key={mode}
                  className="border-2 border-gray-200 rounded-lg p-4"
                >
                  <div
                    className="h-24 rounded-lg mb-3 shadow-sm"
                    style={{ backgroundColor: color as string }}
                  />
                  <p className="text-sm font-bold text-gray-900 mb-1">{mode}</p>
                  <p className="text-xs font-mono text-gray-600">{color as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Available Modules */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircledIcon className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Available Modules
              </h2>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                {allModules.length} total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allModules.map((module) => {
                const isActive = module.module.id === activeModule.module.id;

                return (
                  <div
                    key={module.module.id}
                    className={`border-2 rounded-lg p-4 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div
                      className={`h-16 rounded-lg mb-3 bg-gradient-to-br ${module.gradient.tailwindClass} shadow-sm`}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-bold text-gray-900">
                        {module.module.name}
                      </p>
                      {isActive && (
                        <CheckCircledIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {module.module.productLine}
                    </p>
                    <p className="text-xs font-mono text-gray-500">
                      {module.module.id} • v{module.module.version}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <InfoCircledIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Module System Information
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Module switching is a global operation that affects the entire
                    platform
                  </li>
                  <li>
                    • All color schemes, gradients, and branding will update
                    immediately
                  </li>
                  <li>
                    • The page will reload to apply new module configuration
                  </li>
                  <li>• Only SUPER_ADMIN users can switch modules</li>
                  <li>
                    • Mode colors are automatically distributed from the module's
                    gradient
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
