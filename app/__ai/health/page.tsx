/**
 * AI Health Debug Page
 * Development endpoint for monitoring AI system status
 * URL: /__ai/health
 */

"use client";

import React, { useState, useEffect } from "react";

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'error';
  lastCheck: string;
  details?: string;
}

export default function AIHealthPage() {
  const [health, setHealth] = useState<HealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    const checks: HealthStatus[] = [];

    // Check OpsChief endpoint
    try {
      const response = await fetch('/api/ai/opschief?tenantId=platform');
      checks.push({
        service: 'OpsChief API',
        status: response.ok ? 'healthy' : 'error',
        lastCheck: new Date().toISOString(),
        details: response.ok ? 'Responding normally' : `HTTP ${response.status}`
      });
    } catch (error) {
      checks.push({
        service: 'OpsChief API',
        status: 'error',
        lastCheck: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check AskSGM endpoint
    try {
      const response = await fetch('/api/ai/asksgm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'health check' }],
          tenantId: 'platform'
        })
      });
      checks.push({
        service: 'AskSGM API',
        status: response.ok ? 'healthy' : 'error',
        lastCheck: new Date().toISOString(),
        details: response.ok ? 'Responding normally' : `HTTP ${response.status}`
      });
    } catch (error) {
      checks.push({
        service: 'AskSGM API',
        status: 'error',
        lastCheck: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check environment variables
    const hasAnthropicKey = !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    checks.push({
      service: 'Environment Config',
      status: hasAnthropicKey ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      details: hasAnthropicKey ? 'API keys configured' : 'Some API keys missing'
    });

    setHealth(checks);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'degraded': return '⚠';
      case 'error': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI System Health</h1>
          <p className="text-gray-600">SGM SPARCC - AI Services Status Monitor</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
            <button
              onClick={checkHealth}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          <div className="space-y-3">
            {health.map((check, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(check.status)}</span>
                    <div>
                      <h3 className="font-semibold">{check.service}</h3>
                      <p className="text-sm">{check.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-semibold">{check.status}</span>
                    <p className="text-xs opacity-75">
                      {new Date(check.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">ℹ️ About This Page</h3>
          <p className="text-sm text-purple-800">
            This development page monitors the health of AI services in SGM SPARCC.
            It checks the availability and responsiveness of OpsChief and AskSGM endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
