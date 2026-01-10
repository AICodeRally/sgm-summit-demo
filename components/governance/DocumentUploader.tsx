'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export interface UploadedDocument {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error?: string;
  analysisResult?: AnalysisResult;
}

export interface AnalysisResult {
  document_name: string;
  coverage_score: number;
  liability_score: number;
  total_gaps: number;
  total_requirements: number;
  gaps: GapEntry[];
  risk_triggers: RiskTrigger[];
  analyzed_at: string;
}

export interface GapEntry {
  policy_code: string;
  policy_name: string;
  requirement_id: string;
  requirement_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'UNMET' | 'PARTIAL' | 'MET';
  evidence?: string[];
}

export interface RiskTrigger {
  id: string;
  name: string;
  description: string;
  impact: number;
  matched_patterns: string[];
}

interface DocumentUploaderProps {
  jurisdiction?: string;
  onAnalysisComplete?: (result: AnalysisResult, file: File) => void;
  maxFiles?: number;
  allowBatch?: boolean;
}

export function DocumentUploader({
  jurisdiction = 'CA',
  onAnalysisComplete,
  maxFiles = 5,
  allowBatch = true,
}: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Add files to state
      const newDocuments: UploadedDocument[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}`,
        status: 'pending',
        progress: 0,
      }));

      setDocuments((prev) => [...prev, ...newDocuments]);

      // Process each file
      for (const doc of newDocuments) {
        await analyzeDocument(doc);
      }
    },
    [jurisdiction]
  );

  const analyzeDocument = async (doc: UploadedDocument) => {
    try {
      // Update status to uploading
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, status: 'uploading', progress: 10 } : d
        )
      );

      // Create form data
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('jurisdiction', jurisdiction);

      // Upload and analyze
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, status: 'analyzing', progress: 30 } : d
        )
      );

      const response = await fetch('/api/governance/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();

      // Update with results
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                status: 'complete',
                progress: 100,
                analysisResult: result,
              }
            : d
        )
      );

      // Callback
      if (onAnalysisComplete) {
        onAnalysisComplete(result, doc.file);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : d
        )
      );
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: allowBatch ? maxFiles : 1,
    multiple: allowBatch,
  });

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg text-blue-600 font-medium">
            Drop files here to analyze...
          </p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 font-medium mb-2">
              Drop compensation plan documents here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              Accepts PDF, DOCX, DOC, TXT • {allowBatch ? `Up to ${maxFiles} files` : '1 file at a time'}
            </p>
          </div>
        )}
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {documents.length} Document{documents.length > 1 ? 's' : ''}
          </h3>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onRemove={() => removeDocument(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocumentCardProps {
  document: UploadedDocument;
  onRemove: () => void;
}

function DocumentCard({ document, onRemove }: DocumentCardProps) {
  const { file, status, progress, error, analysisResult } = document;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <File className="w-5 h-5 text-gray-400" />;
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading...';
      case 'analyzing':
        return 'Analyzing...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-gray-600';
      case 'uploading':
      case 'analyzing':
        return 'text-blue-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getCoverageGrade = (score: number) => {
    if (score >= 0.8) return { grade: 'A', color: 'text-green-600' };
    if (score >= 0.4) return { grade: 'B', color: 'text-yellow-600' };
    return { grade: 'C', color: 'text-red-600' };
  };

  const getLiabilityColor = (score: number) => {
    if (score >= 4) return 'text-red-600';
    if (score >= 3) return 'text-orange-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
              <span className={getStatusColor()}>{getStatusText()}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'analyzing') && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {status === 'complete' && analysisResult && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Coverage */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Coverage</p>
              <p className="text-2xl font-bold">
                <span
                  className={
                    getCoverageGrade(analysisResult.coverage_score).color
                  }
                >
                  {getCoverageGrade(analysisResult.coverage_score).grade}
                </span>
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {(analysisResult.coverage_score * 100).toFixed(1)}%
                </span>
              </p>
            </div>

            {/* Liability */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Liability</p>
              <p className="text-2xl font-bold">
                <span
                  className={getLiabilityColor(analysisResult.liability_score)}
                >
                  {analysisResult.liability_score.toFixed(1)}
                </span>
                <span className="text-sm font-normal text-gray-500">/5.0</span>
              </p>
            </div>

            {/* Total Gaps */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Gaps</p>
              <p className="text-2xl font-bold text-gray-900">
                {analysisResult.total_gaps}
              </p>
            </div>

            {/* Risk Triggers */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Risk Triggers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analysisResult.risk_triggers.length}
              </p>
            </div>
          </div>

          {/* Gap Breakdown by Severity */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Gap Breakdown</p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">
                  Critical:{' '}
                  {
                    analysisResult.gaps.filter((g) => g.severity === 'CRITICAL')
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-gray-600">
                  High:{' '}
                  {
                    analysisResult.gaps.filter((g) => g.severity === 'HIGH')
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600">
                  Medium:{' '}
                  {
                    analysisResult.gaps.filter((g) => g.severity === 'MEDIUM')
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">
                  Low:{' '}
                  {
                    analysisResult.gaps.filter((g) => g.severity === 'LOW')
                      .length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
