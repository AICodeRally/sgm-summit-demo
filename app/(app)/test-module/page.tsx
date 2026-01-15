'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
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
        <div className="mb-8 p-6 bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-border)]">
          <h2 className="text-xl font-bold mb-4">Current Module</h2>
          <div className={`h-32 rounded-lg bg-gradient-to-r ${currentModule.gradient.tailwindClass} mb-4`} />
          <p><strong>ID:</strong> {currentModule.module.id}</p>
          <p><strong>Name:</strong> {currentModule.module.name}</p>
          <p><strong>Product Line:</strong> {currentModule.module.productLine}</p>
          <p><strong>Tagline:</strong> {currentModule.module.tagline}</p>
        </div>

        {/* Mode Colors */}
        <div className="mb-8 p-6 bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-border)]">
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
        <div className="p-6 bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-border)]">
          <h2 className="text-xl font-bold mb-4">Switch Module</h2>
          <p className="text-sm text-[color:var(--color-muted)] mb-4">
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
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)] cursor-not-allowed'
                      : 'border-[color:var(--color-border)] hover:border-[color:var(--color-info-border)] hover:shadow-md'
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
                          <span className="px-2 py-1 bg-[color:var(--color-surface-alt)]0 text-white text-xs rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[color:var(--color-muted)]">{module.module.name}</p>
                      <p className="text-xs text-[color:var(--color-muted)]">{module.module.id} • v{module.module.version}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Architecture Note */}
        <div className="mt-8 p-6 bg-[color:var(--color-warning-bg)] border-2 border-[color:var(--color-warning-border)] rounded-lg">
          <h3 className="flex items-center gap-2 font-bold text-[color:var(--color-warning)] mb-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            DEV MODE ONLY
          </h3>
          <p className="text-sm text-[color:var(--color-warning)]">
            <strong>This module switcher is for development/demo only.</strong>
          </p>
          <p className="text-sm text-[color:var(--color-warning)] mt-2">
            In production, the module should be:
          </p>
          <ul className="text-sm text-[color:var(--color-warning)] mt-2 space-y-1 ml-4">
            <li>• Set via <code className="bg-[color:var(--color-warning-bg)] px-1">NEXT_PUBLIC_SPARCC_MODULE</code> environment variable</li>
            <li>• Or configured per-tenant in the database</li>
            <li>• NOT switchable at runtime by admins (affects all users globally)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
