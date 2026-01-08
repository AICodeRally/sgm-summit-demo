'use client';

import { useState, useEffect } from 'react';
import {
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  EyeIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { AgentOrchestrator } from '@/lib/ai/agents/orchestrator';
import type { AgentSuggestion, AgentContext } from '@/lib/ai/agents/orchestrator';
import type { Plan } from '@/lib/contracts/plan.contract';
import type { PlanSection } from '@/lib/contracts/plan-section.contract';

interface AgentSuggestionPanelProps {
  plan: Plan;
  section: PlanSection | null;
  content: string;
  onApplySuggestion: (suggestion: AgentSuggestion) => void;
}

const agentIcons = {
  POLICY_EXPERT: ShieldCheckIcon,
  DESIGN: PencilSquareIcon,
  UIUX: EyeIcon,
  KNOWLEDGE_BASE: BookOpenIcon,
};

const agentColors = {
  POLICY_EXPERT: 'text-red-600 bg-red-50 border-red-200',
  DESIGN: 'text-blue-600 bg-blue-50 border-blue-200',
  UIUX: 'text-purple-600 bg-purple-50 border-purple-200',
  KNOWLEDGE_BASE: 'text-green-600 bg-green-50 border-green-200',
};

const priorityColors = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function AgentSuggestionPanel({
  plan,
  section,
  content,
  onApplySuggestion,
}: AgentSuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'realtime' | 'comprehensive'>('realtime');

  useEffect(() => {
    if (section && content.length > 50) {
      // Debounce AI suggestions to avoid too many calls
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [section?.id, content]);

  const fetchSuggestions = async () => {
    if (!section) return;

    setLoading(true);
    try {
      // Fetch applicable governance frameworks
      const frameworksResponse = await fetch(
        `/api/governance-framework/applicable?planType=${plan.planType}&tenantId=${plan.tenantId}`
      );
      const frameworksData = await frameworksResponse.json();
      const governanceFrameworks = frameworksData.frameworks || [];

      const context: AgentContext = {
        plan,
        section,
        content,
        planType: plan.planType,
        governanceFrameworks,
      };

      const orchestrator = new AgentOrchestrator(mode);
      const response = await orchestrator.getSuggestions(context);

      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(new Set(dismissed).add(id));
  };

  const handleApply = (suggestion: AgentSuggestion) => {
    onApplySuggestion(suggestion);
    handleDismiss(suggestion.id);
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-200 bg-white/90">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">AI Suggestions</h3>
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={!section || loading}
            className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400"
          >
            Refresh
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('realtime')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              mode === 'realtime'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Real-time
          </button>
          <button
            onClick={() => setMode('comprehensive')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              mode === 'comprehensive'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Comprehensive
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-purple-600">
              <SparklesIcon className="h-5 w-5 animate-spin" />
              <span className="text-sm">Analyzing content...</span>
            </div>
          </div>
        )}

        {!loading && visibleSuggestions.length === 0 && section && (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {content.length > 50
                ? "Looking good! No suggestions at the moment."
                : "Start writing to get AI suggestions"}
            </p>
          </div>
        )}

        {!loading && !section && (
          <div className="text-center py-8">
            <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Select a section to get AI suggestions
            </p>
          </div>
        )}

        {visibleSuggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onApply={() => handleApply(suggestion)}
            onDismiss={() => handleDismiss(suggestion.id)}
          />
        ))}
      </div>

      {/* Footer */}
      {visibleSuggestions.length > 0 && (
        <div className="p-4 border-t border-purple-200 bg-white/90">
          <div className="text-xs text-gray-500 text-center">
            {visibleSuggestions.length} suggestion{visibleSuggestions.length !== 1 ? 's' : ''} from {
              new Set(visibleSuggestions.map(s => s.agentType)).size
            } agents
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: AgentSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const AgentIcon = agentIcons[suggestion.agentType];

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${agentColors[suggestion.agentType]}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AgentIcon className="h-5 w-5 flex-none" />
            <div>
              <div className="font-medium text-sm">{suggestion.agentName}</div>
              <div className="text-xs opacity-75">{suggestion.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${priorityColors[suggestion.priority]}`}>
              {suggestion.priority}
            </span>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-black/5 rounded transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
        <p className="text-sm text-gray-700 mb-3">{suggestion.message}</p>

        {suggestion.suggestedAction && (
          <div className="text-sm bg-white/50 rounded p-2 mb-2">
            <div className="font-medium text-gray-700 mb-1">Suggested Action:</div>
            <div className="text-gray-600">{suggestion.suggestedAction}</div>
          </div>
        )}

        {suggestion.suggestedContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-current font-medium hover:underline"
          >
            {expanded ? 'Hide' : 'View'} suggested content →
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && suggestion.suggestedContent && (
        <div className="border-t border-current/20 bg-white/30 p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap bg-white/50 p-3 rounded">
            {suggestion.suggestedContent}
          </pre>
          <button
            onClick={onApply}
            className="mt-3 px-4 py-2 bg-current text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium w-full justify-center"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            Apply This Content
          </button>
        </div>
      )}

      {/* Reasoning */}
      {suggestion.reasoning && expanded && (
        <div className="border-t border-current/20 bg-white/20 px-4 py-3 text-xs text-gray-600">
          <strong>Why:</strong> {suggestion.reasoning}
        </div>
      )}

      {/* References */}
      {suggestion.references && suggestion.references.length > 0 && expanded && (
        <div className="border-t border-current/20 bg-white/20 px-4 py-3 text-xs">
          <strong>References:</strong> {suggestion.references.join(', ')}
        </div>
      )}
    </div>
  );
}
