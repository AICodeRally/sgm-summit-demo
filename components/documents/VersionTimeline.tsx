'use client';

import {
  FileIcon,
  GearIcon,
  Pencil1Icon,
  EyeOpenIcon,
  CheckCircledIcon,
  RocketIcon,
  UpdateIcon,
  ArchiveIcon
} from '@radix-ui/react-icons';

export interface VersionTimelineEntry {
  id: string;
  versionNumber: string;
  versionLabel?: string;
  lifecycleStatus: 'RAW' | 'PROCESSED' | 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE_FINAL' | 'SUPERSEDED' | 'ARCHIVED';
  createdBy: string;
  createdAt: Date | string;
  changeDescription?: string;
  changeType: 'MAJOR' | 'MINOR' | 'PATCH' | 'EMERGENCY';
  isCurrent: boolean;
}

interface VersionTimelineProps {
  timeline: VersionTimelineEntry[];
  onVersionClick?: (version: VersionTimelineEntry) => void;
}

export function VersionTimeline({ timeline, onVersionClick }: VersionTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RAW':
        return <FileIcon className="w-5 h-5" />;
      case 'PROCESSED':
        return <GearIcon className="w-5 h-5" />;
      case 'DRAFT':
        return <Pencil1Icon className="w-5 h-5" />;
      case 'UNDER_REVIEW':
        return <EyeOpenIcon className="w-5 h-5" />;
      case 'APPROVED':
        return <CheckCircledIcon className="w-5 h-5" />;
      case 'ACTIVE_FINAL':
        return <RocketIcon className="w-5 h-5" />;
      case 'SUPERSEDED':
        return <UpdateIcon className="w-5 h-5" />;
      case 'ARCHIVED':
        return <ArchiveIcon className="w-5 h-5" />;
      default:
        return <FileIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RAW':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          dot: 'bg-gray-400',
        };
      case 'PROCESSED':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          dot: 'bg-blue-500',
        };
      case 'DRAFT':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          dot: 'bg-yellow-500',
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-300',
          text: 'text-orange-800',
          icon: 'text-orange-600',
          dot: 'bg-orange-500',
        };
      case 'APPROVED':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          text: 'text-purple-800',
          icon: 'text-purple-600',
          dot: 'bg-purple-500',
        };
      case 'ACTIVE_FINAL':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: 'text-green-600',
          dot: 'bg-green-500',
        };
      case 'SUPERSEDED':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-600',
          icon: 'text-gray-500',
          dot: 'bg-gray-400',
        };
      case 'ARCHIVED':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-500',
          icon: 'text-gray-400',
          dot: 'bg-gray-300',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          dot: 'bg-gray-400',
        };
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MINOR':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PATCH':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'EMERGENCY':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Version History Timeline</h2>
        <div className="text-sm text-gray-600">
          {timeline.length} version{timeline.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-fuchsia-300 to-yellow-300"></div>

        {/* Timeline Entries */}
        <div className="space-y-8">
          {timeline.map((entry, index) => {
            const colors = getStatusColor(entry.lifecycleStatus);
            const isLast = index === timeline.length - 1;

            return (
              <div key={entry.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div className={'absolute left-0 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-lg ' + colors.bg}>
                  <div className={colors.icon}>
                    {getStatusIcon(entry.lifecycleStatus)}
                  </div>
                </div>

                {/* Content Card */}
                <div
                  className={'rounded-xl border-2 p-5 transition-all ' + (entry.isCurrent ? 'border-purple-500 shadow-xl bg-white' : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg') + (onVersionClick ? ' cursor-pointer' : '')}
                  onClick={() => onVersionClick?.(entry)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg text-gray-900">
                        v{entry.versionNumber}
                      </span>
                      <span className={'px-3 py-1 rounded-full text-xs font-bold border ' + colors.bg + ' ' + colors.border + ' ' + colors.text}>
                        {entry.lifecycleStatus.replace('_', ' ')}
                      </span>
                      <span className={'px-2 py-0.5 rounded text-xs font-semibold border ' + getChangeTypeColor(entry.changeType)}>
                        {entry.changeType}
                      </span>
                      {entry.isCurrent && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="text-right text-sm text-gray-600">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {entry.versionLabel && (
                    <div className="font-semibold text-gray-900 mb-2">
                      {entry.versionLabel}
                    </div>
                  )}

                  {entry.changeDescription && (
                    <p className="text-gray-700 mb-3 text-sm">
                      {entry.changeDescription}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Created by:</span> {entry.createdBy}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        Complete version history with full provenance tracking
      </div>
    </div>
  );
}
