'use client';

import { useState } from 'react';
import { getActiveModule, setActiveModule, getAllModules } from '@/lib/config/module-registry';

export default function TestModulePage() {
  const [currentModule, setCurrentModule] = useState(getActiveModule());
  const allModules = getAllModules();

  const handleSwitch = (moduleId: string) => {
    const success = setActiveModule(moduleId);
    if (success) {
      // Force full page reload to re-import with new module
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Module Switching Test</h1>

        {/* Current Module Display */}
        <div className="mb-8 p-6 bg-white rounded-lg border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Current Module</h2>
          <div className={`h-32 rounded-lg bg-gradient-to-r ${currentModule.gradient.tailwindClass} mb-4`} />
          <p><strong>ID:</strong> {currentModule.module.id}</p>
          <p><strong>Name:</strong> {currentModule.module.name}</p>
          <p><strong>Product Line:</strong> {currentModule.module.productLine}</p>
          <p><strong>Tagline:</strong> {currentModule.module.tagline}</p>
        </div>

        {/* Mode Colors */}
        <div className="mb-8 p-6 bg-white rounded-lg border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Mode Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(currentModule.modeColors).map(([mode, color]) => (
              <div key={mode}>
                <div
                  className="h-24 rounded-lg mb-2"
                  style={{ backgroundColor: color as string }}
                />
                <p className="text-sm font-bold">{mode}</p>
                <p className="text-xs font-mono">{color as string}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Switch Buttons */}
        <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Switch Module</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click a module to switch. Page will reload with new colors.
          </p>
          <div className="space-y-3">
            {allModules.map((module) => {
              const isActive = module.module.id === currentModule.module.id;
              return (
                <button
                  key={module.module.id}
                  onClick={() => handleSwitch(module.module.id)}
                  disabled={isActive}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${module.gradient.tailwindClass}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{module.module.productLine}</p>
                        {isActive && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{module.module.name}</p>
                      <p className="text-xs text-gray-500">{module.module.id} • v{module.module.version}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Architecture Note */}
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ DEV MODE ONLY</h3>
          <p className="text-sm text-yellow-800">
            <strong>This module switcher is for development/demo only.</strong>
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            In production, the module should be:
          </p>
          <ul className="text-sm text-yellow-800 mt-2 space-y-1 ml-4">
            <li>• Set via <code className="bg-yellow-100 px-1">NEXT_PUBLIC_SPARCC_MODULE</code> environment variable</li>
            <li>• Or configured per-tenant in the database</li>
            <li>• NOT switchable at runtime by admins (affects all users globally)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
