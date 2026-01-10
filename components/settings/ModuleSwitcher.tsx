'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  getActiveModule,
  getAllModules,
  setActiveModule,
  type ModuleConfig,
} from '@/lib/config/module-registry';
import {
  ChevronDownIcon,
  CheckIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';

export function ModuleSwitcher() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const activeModule = getActiveModule();
  const allModules = getAllModules();

  // For demo: Always show Module Switcher
  // In production, uncomment this check:
  // if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
  //   return null;
  // }

  const handleModuleSwitch = async (moduleId: string) => {
    if (moduleId === activeModule.module.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);

    try {
      // Call API to switch module
      const response = await fetch('/api/settings/module', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moduleId }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch module');
      }

      // Update client-side registry
      setActiveModule(moduleId);

      // Reload page to apply new module colors
      window.location.reload();
    } catch (error) {
      console.error('Error switching module:', error);
      alert('Failed to switch module. Please try again.');
      setIsSwitching(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Current Module Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Module Gradient Preview */}
        <div
          className={`w-8 h-8 rounded-md bg-gradient-to-br ${activeModule.gradient.tailwindClass}`}
          title={`${activeModule.module.name} Gradient`}
        />

        {/* Module Info */}
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">
            {activeModule.module.productLine}
          </p>
          <p className="text-xs text-gray-600">
            {activeModule.module.name} • v{activeModule.module.version}
          </p>
        </div>

        {/* Icon */}
        {isSwitching ? (
          <ReloadIcon className="w-4 h-4 text-gray-600 animate-spin" />
        ) : (
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full mt-2 right-0 w-96 bg-white rounded-xl border-2 border-gray-200 shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-bold text-gray-900">
                Switch SPARCC Module
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Changes will reload the page to apply new colors
              </p>
            </div>

            {/* Module List */}
            <div className="max-h-96 overflow-y-auto">
              {allModules.map((module) => {
                const isActive = module.module.id === activeModule.module.id;

                return (
                  <button
                    key={module.module.id}
                    onClick={() => handleModuleSwitch(module.module.id)}
                    disabled={isSwitching}
                    className={`w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Gradient Preview */}
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${module.gradient.tailwindClass} flex-shrink-0 shadow-md`}
                      title={`${module.module.name} Gradient`}
                    />

                    {/* Module Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          {module.module.productLine}
                        </p>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-medium mb-1">
                        {module.module.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        v{module.module.version} • {module.data.apiVersion}
                      </p>

                      {/* Color Stops */}
                      <div className="flex items-center gap-1 mt-2">
                        <div
                          className="w-4 h-4 rounded-sm border border-gray-300"
                          style={{ backgroundColor: module.gradient.start }}
                          title="Start"
                        />
                        {module.gradient.mid1 && (
                          <div
                            className="w-4 h-4 rounded-sm border border-gray-300"
                            style={{ backgroundColor: module.gradient.mid1 }}
                            title="Mid 1"
                          />
                        )}
                        {module.gradient.mid2 && (
                          <div
                            className="w-4 h-4 rounded-sm border border-gray-300"
                            style={{ backgroundColor: module.gradient.mid2 }}
                            title="Mid 2"
                          />
                        )}
                        {module.gradient.mid3 && (
                          <div
                            className="w-4 h-4 rounded-sm border border-gray-300"
                            style={{ backgroundColor: module.gradient.mid3 }}
                            title="Mid 3"
                          />
                        )}
                        <div
                          className="w-4 h-4 rounded-sm border border-gray-300"
                          style={{ backgroundColor: module.gradient.end }}
                          title="End"
                        />
                      </div>
                    </div>

                    {/* Check Icon */}
                    {isActive && (
                      <CheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600">
                Total modules: {allModules.length} • Currently active:{' '}
                {activeModule.module.id}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
