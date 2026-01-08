"use client";

import React, { useState, useEffect } from "react";
// import { AppShell } from "@rally/app-shell"; // Rally package not yet installed
import { aiManifest } from "../ai.manifest";
import { CommandPalette } from "@/components/CommandPalette";
import { OpsChiefOrb } from "@/components/ai/OpsChiefOrb";
import { AskDock } from "@/components/ai/AskDock";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTitleProvider } from "@/components/PageTitle";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Client-side root layout wrapper
 * Handles AI components initialization
 */
export function RootLayoutClient({ children }: RootLayoutClientProps) {
  // Command Palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PageTitleProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pb-24">
          {children}
        </main>
        <Footer />
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
        {/* AI Widgets */}
        <OpsChiefOrb appName="SGM SPARCC" enabled={true} />
        <AskDock appName="SGM" enabled={true} />
      </div>
    </PageTitleProvider>
  );
}
