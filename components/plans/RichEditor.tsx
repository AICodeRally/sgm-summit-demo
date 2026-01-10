'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  EyeOpenIcon,
  Pencil1Icon,
  CheckIcon,
  FontBoldIcon,
  FontItalicIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import type { PlanSection } from '@/lib/contracts/plan-section.contract';

interface RichEditorProps {
  section: PlanSection;
  onContentChange: (content: string) => void;
  onMarkComplete: () => void;
}

type EditorMode = 'write' | 'preview' | 'split';

export default function RichEditor({
  section,
  onContentChange,
  onMarkComplete,
}: RichEditorProps) {
  const [mode, setMode] = useState<EditorMode>('write');
  const [content, setContent] = useState(section.content || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setContent(section.content || '');
  }, [section.id]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for auto-save (3 seconds)
    const timer = setTimeout(() => {
      onContentChange(newContent);
    }, 3000);

    setDebounceTimer(timer);
  }, [debounceTimer, onContentChange]);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);

    handleContentChange(newContent);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering (in production, use a library like react-markdown)
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li.*?<\/li>)+/g, '<ul class="list-disc ml-6 space-y-1">$&</ul>');

    return html;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Section Header */}
      <div className="p-6 border-b border-purple-200 bg-white/90">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {section.title}
              </h2>
              {section.isRequired && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                  Required
                </span>
              )}
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                section.completionStatus === 'COMPLETED'
                  ? 'bg-green-100 text-green-700'
                  : section.completionStatus === 'IN_PROGRESS'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {section.completionStatus?.replace('_', ' ')}
              </span>
            </div>
            {section.description && (
              <p className="text-gray-600">{section.description}</p>
            )}
          </div>
          {section.completionStatus !== 'COMPLETED' && (
            <button
              onClick={onMarkComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckIcon className="h-5 w-5" />
              Mark Complete
            </button>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('write')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              mode === 'write'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Pencil1Icon className="h-4 w-4" />
            Write
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              mode === 'preview'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <EyeOpenIcon className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => setMode('split')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              mode === 'split'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Split
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {(mode === 'write' || mode === 'split') && (
        <div className="p-4 border-b border-purple-200 bg-white/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => insertMarkdown('**', '**')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Bold"
            >
              <span className="font-bold">B</span>
            </button>
            <button
              onClick={() => insertMarkdown('*', '*')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Italic"
            >
              <span className="italic">I</span>
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => insertMarkdown('# ', '')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm font-medium"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => insertMarkdown('## ', '')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm font-medium"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => insertMarkdown('### ', '')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm font-medium"
              title="Heading 3"
            >
              H3
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => insertMarkdown('- ', '')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Bullet List"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'write' && (
          <textarea
            id="markdown-editor"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing in markdown... Use # for headings, **bold**, *italic*, - for lists"
            className="w-full h-full p-8 resize-none focus:outline-none font-mono text-gray-800"
            style={{ minHeight: '100%' }}
          />
        )}

        {mode === 'preview' && (
          <div
            className="p-8 prose prose-purple max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}

        {mode === 'split' && (
          <div className="flex h-full">
            <div className="w-1/2 border-r border-purple-200">
              <textarea
                id="markdown-editor"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing in markdown..."
                className="w-full h-full p-8 resize-none focus:outline-none font-mono text-gray-800"
              />
            </div>
            <div className="w-1/2 overflow-y-auto">
              <div
                className="p-8 prose prose-purple max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-purple-200 bg-white/90">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            {content.length} characters, {content.split(/\s+/).filter(w => w.length > 0).length} words
          </div>
          <div>
            Auto-saves 3 seconds after you stop typing
          </div>
        </div>
      </div>
    </div>
  );
}
