/**
 * AI Health Debug Page
 * Development endpoint for monitoring AI Backbone status
 * URL: /__ai/health
 */

"use client";

import React, { useState, useEffect } from "react";
import { AIHealthPage } from "@rally/blocks-ai";
import { useAI, useTenant } from "@rally/app-shell";

interface TelemetryEntry {
  name: string;
  ts: string;
}

interface SignalEntry {
  type: string;
  ts: string;
}

export default function AIHealthPageRoute() {
  const ai = useAI();
  const tenant = useTenant();
  const [recentTelemetry, setRecentTelemetry] = useState<TelemetryEntry[]>([]);
  const [recentSignals, setRecentSignals] = useState<SignalEntry[]>([]);
  const [backends, setBackends] = useState({ local: false, cloud: true });

  useEffect(() => {
    // Get recent telemetry events
    const telemetry = ai.telemetry.getRecent(10);
    setRecentTelemetry(
      telemetry.map((e: any) => ({
        name: e.name,
        ts: e.ts,
      }))
    );

    // Get recent signals
    const signals = ai.signalBus.getRecent(undefined, 10);
    setRecentSignals(
      signals.map((s: any) => ({
        type: s.type,
        ts: s.ts,
      }))
    );

    // Get backend availability
    const backendStatus = ai.llmClient.getAvailableBackends();
    setBackends(backendStatus);

    // Refresh periodically
    const interval = setInterval(() => {
      const telemetry = ai.telemetry.getRecent(10);
      setRecentTelemetry(
        telemetry.map((e: any) => ({
          name: e.name,
          ts: e.ts,
        }))
      );

      const signals = ai.signalBus.getRecent(undefined, 10);
      setRecentSignals(
        signals.map((s: any) => ({
          type: s.type,
          ts: s.ts,
        }))
      );

      const backendStatus = ai.llmClient.getAvailableBackends();
      setBackends(backendStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, [ai]);

  return (
    <AIHealthPage
      telemetryRecent={recentTelemetry}
      signalsRecent={recentSignals}
      backends={backends}
      appId={tenant.appId}
      tenantId={tenant.tenantId}
      tier={tenant.tier}
    />
  );
}
