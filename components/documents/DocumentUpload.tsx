'use client';

import React, { useState, useRef, useCallback } from 'react';
import { validateFile, getFileTypeFromExtension } from '@/lib/utils/file-validation';

interface DocumentUploadProps {
  onUpload: (files: File[], metadata: { documentCode: string; title: string; documentType: string }) => Promise<void>;
  onClose?: () => void;
}

export default function DocumentUpload({ onUpload, onClose }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState({
    documentCode: '',
    title: '',
    documentType: 'POLICY',
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDropOrSelect = useCallback((droppedFiles: FileList | null) => {
    if (!droppedFiles) return;

    setIsDragging(false);
    setError(null);

    const newFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      const fileType = getFileTypeFromExtension(file.name);

      if (!fileType) {
        errors.push(`${file.name}: Unsupported file type`);
        continue;
      }

      const validation = validateFile(file, fileType);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
        continue;
      }

      newFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDropOrSelect(e.dataTransfer.files);
    },
    [handleDropOrSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleDropOrSelect(e.target.files);
    },
    [handleDropOrSelect]
  );

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (!metadata.documentCode || !metadata.title) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onUpload(files, metadata);
      setFiles([]);
      setMetadata({ documentCode: '', title: '', documentType: 'POLICY' });
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* File Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <div className="text-4xl">📤</div>
            <h3 className="text-lg font-medium text-gray-900">Drop files here or click to select</h3>
            <p className="text-sm text-gray-600">
              Supported formats: .md, .docx, .pdf, .xlsx, .pptx (Max 50MB each)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleInputChange}
            accept=".md,.docx,.pdf,.xlsx,.pptx"
            className="hidden"
          />
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Selected Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Document Details</h3>

          <div>
            <label htmlFor="documentCode" className="block text-sm text-gray-700 mb-1">
              Document Code *
            </label>
            <input
              id="documentCode"
              type="text"
              placeholder="e.g., POL-001"
              value={metadata.documentCode}
              onChange={e => setMetadata(prev => ({ ...prev, documentCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Sales Crediting Policy"
              value={metadata.title}
              onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label htmlFor="documentType" className="block text-sm text-gray-700 mb-1">
              Document Type
            </label>
            <select
              id="documentType"
              value={metadata.documentType}
              onChange={e => setMetadata(prev => ({ ...prev, documentType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="FRAMEWORK">Framework</option>
              <option value="POLICY">Policy</option>
              <option value="PROCEDURE">Procedure</option>
              <option value="TEMPLATE">Template</option>
              <option value="CHECKLIST">Checklist</option>
              <option value="GUIDE">Guide</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || files.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {loading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
