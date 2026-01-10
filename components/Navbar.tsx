'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePageTitle } from './PageTitle';
import { ModeSwitcher } from './auth/ModeSwitcher';
import { useMode } from '@/lib/auth/mode-context';
import { OperationalMode } from '@/types/operational-mode';
import { getActiveModule } from '@/lib/config/module-registry';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';

export function Navbar() {
  const { title, description } = usePageTitle();
  const { currentMode } = useMode();
  const activeModule = getActiveModule();
  const [user, setUser] = useState({
    name: 'Sarah Chen',
    role: 'Governance Administrator',
    email: 'sarah.chen@henryschein.com'
  });

  // Map icons
  const iconMap = {
    [OperationalMode.DESIGN]: Pencil2Icon,
    [OperationalMode.OPERATE]: GearIcon,
    [OperationalMode.DISPUTE]: ExclamationTriangleIcon,
    [OperationalMode.OVERSEE]: EyeOpenIcon,
  };

  // Mode tabs configuration
  const modeTabs = [
    { mode: OperationalMode.DESIGN, label: 'Design', href: '/design', color: 'purple' },
    { mode: OperationalMode.OPERATE, label: 'Operate', href: '/operate', color: 'fuchsia' },
    { mode: OperationalMode.DISPUTE, label: 'Dispute', href: '/dispute', color: 'blue' },
    { mode: OperationalMode.OVERSEE, label: 'Oversee', href: '/oversee', color: 'indigo' },
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'purple':
          return 'bg-purple-50 text-purple-700 border-purple-500';
        case 'fuchsia':
          return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-500';
        case 'blue':
          return 'bg-blue-50 text-blue-700 border-blue-500';
        case 'indigo':
          return 'bg-indigo-50 text-indigo-700 border-indigo-500';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-500';
      }
    }
    return 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b-4 border-transparent" style={{
      borderImage: 'linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234)) 1'
    }}>
      <div className="w-full px-6">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Left side: SPARCC text logo + SGM circle + module info */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-4 group">
              {/* SPARCC Text Logo */}
              <div className="flex flex-col items-center">
                <span className={`text-3xl font-bold bg-gradient-to-r ${activeModule.gradient.tailwindClass} bg-clip-text text-transparent tracking-tight`}>
                  SPARCC
                </span>
                <span className="text-[8px] text-gray-400 uppercase tracking-widest -mt-1">
                  {activeModule.module.tagline}
                </span>
              </div>

              {/* SGM Circle */}
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${activeModule.gradient.tailwindClass} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                <span className="text-white font-bold text-xl">SGM</span>
              </div>

              {/* SGM Module Info */}
              <div className="border-l border-purple-300 pl-6">
                <h1 className={`text-lg font-bold bg-gradient-to-r ${activeModule.gradient.tailwindClass} bg-clip-text text-transparent`}>
                  {title}
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  {description}
                </p>
              </div>
            </Link>
          </div>

          {/* Right side: Mode Switcher + User info */}
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <div className="border-l border-purple-300 pl-4 text-right">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
