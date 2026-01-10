/**
 * GovLens API Client
 *
 * TypeScript client for calling the Python GovLens API service.
 * Provides document analysis, batch processing, and report retrieval.
 */

/**
 * API Configuration
 */
const GOVLENS_API_URL = process.env.GOVLENS_API_URL || 'http://localhost:8000';

/**
 * API Response Types
 */

export interface GapEntry {
  policy_code: string;
  policy_name: string;
  requirement_id: string;
  requirement_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'MET' | 'PARTIAL' | 'UNMET';
  evidence?: string[];
}

export interface RiskTrigger {
  id: string;
  name: string;
  description: string;
  impact: number;
  matched_patterns: string[];
  found_in: string[];
}

export interface Section {
  id: string;
  title: string;
  content: string;
  clause_count: number;
}

export interface AnalysisResponse {
  document_name: string;
  analyzed_at: string;
  jurisdiction: string;
  coverage_score: number;
  liability_score: number;
  total_requirements: number;
  total_gaps: number;
  sections: Section[];
  gaps: GapEntry[];
  risk_triggers: RiskTrigger[];
  output_files: {
    json?: string;
    markdown?: string;
    csv?: string;
  };
}

export interface BatchAnalysisResponse {
  total_documents: number;
  successful: number;
  failed: number;
  average_coverage: number;
  average_liability: number;
  total_gaps: number;
  results: AnalysisResponse[];
  executive_summary_path?: string;
}

export interface ReportListItem {
  document_id: string;
  document_name: string;
  analyzed_at: string;
  coverage_score: number;
  liability_score: number;
  total_gaps: number;
  files: {
    json: string;
    markdown: string;
    csv: string;
  };
}

/**
 * GovLens API Client
 */
export class GovLensAPIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || GOVLENS_API_URL;
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);

    if (!response.ok) {
      throw new Error(`API health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Analyze single document
   */
  async analyzeDocument(
    file: File,
    options: {
      jurisdiction?: string;
      outputFormats?: string[];
    } = {}
  ): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    if (options.jurisdiction) {
      params.append('jurisdiction', options.jurisdiction);
    }
    if (options.outputFormats) {
      params.append('output_formats', options.outputFormats.join(','));
    }

    const url = `${this.baseUrl}/api/analyze?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Analysis failed';
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } else {
        try {
          const text = await response.text();
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Analyze multiple documents (batch)
   */
  async batchAnalyze(
    files: File[],
    options: {
      jurisdiction?: string;
      generateExecutiveSummary?: boolean;
    } = {}
  ): Promise<BatchAnalysisResponse> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    const params = new URLSearchParams();
    if (options.jurisdiction) {
      params.append('jurisdiction', options.jurisdiction);
    }
    if (options.generateExecutiveSummary !== undefined) {
      params.append(
        'generate_executive_summary',
        options.generateExecutiveSummary.toString()
      );
    }

    const url = `${this.baseUrl}/api/batch?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Batch analysis failed');
    }

    return response.json();
  }

  /**
   * Get report by document ID
   */
  async getReport(
    documentId: string,
    format: 'json' | 'markdown' | 'csv' = 'json'
  ): Promise<Blob> {
    const params = new URLSearchParams({ format });
    const url = `${this.baseUrl}/api/reports/${documentId}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Report not found: ${documentId}`);
    }

    return response.blob();
  }

  /**
   * List all available reports
   */
  async listReports(): Promise<{
    total_reports: number;
    reports: ReportListItem[];
  }> {
    const response = await fetch(`${this.baseUrl}/api/reports`);

    if (!response.ok) {
      throw new Error('Failed to list reports');
    }

    return response.json();
  }

  /**
   * Get remediation patches for a document
   */
  async getPatches(documentId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/reports/${documentId}/patches`);

    if (!response.ok) {
      throw new Error(`Patches not found: ${documentId}`);
    }

    return response.text();
  }

  /**
   * Get remediation checklist for a document
   */
  async getChecklist(documentId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/reports/${documentId}/checklist`);

    if (!response.ok) {
      throw new Error(`Checklist not found: ${documentId}`);
    }

    return response.text();
  }

  /**
   * Delete report by document ID
   */
  async deleteReport(documentId: string): Promise<{
    status: string;
    deleted_files: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/api/reports/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete report: ${documentId}`);
    }

    return response.json();
  }
}

/**
 * Singleton instance
 */
let _client: GovLensAPIClient | null = null;

export function getGovLensClient(): GovLensAPIClient {
  if (!_client) {
    _client = new GovLensAPIClient();
  }
  return _client;
}

/**
 * Convenience functions
 */

export async function analyzeDocument(
  file: File,
  jurisdiction: string = 'CA'
): Promise<AnalysisResponse> {
  return getGovLensClient().analyzeDocument(file, { jurisdiction });
}

export async function batchAnalyze(
  files: File[],
  jurisdiction: string = 'CA'
): Promise<BatchAnalysisResponse> {
  return getGovLensClient().batchAnalyze(files, {
    jurisdiction,
    generateExecutiveSummary: true,
  });
}

export async function getReport(
  documentId: string,
  format: 'json' | 'markdown' | 'csv' = 'json'
): Promise<Blob> {
  return getGovLensClient().getReport(documentId, format);
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const result = await getGovLensClient().healthCheck();
    return result.status === 'healthy';
  } catch {
    return false;
  }
}

export async function getPatches(documentId: string): Promise<string> {
  return getGovLensClient().getPatches(documentId);
}

export async function getChecklist(documentId: string): Promise<string> {
  return getGovLensClient().getChecklist(documentId);
}
