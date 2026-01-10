-- SGM Governance Review Models
-- AI-Powered Gap Analysis with The Toddfather Integration

-- Create enums first
CREATE TYPE "GapFinding" AS ENUM ('EVIDENCED', 'PARTIAL', 'NOT_EVIDENCED');
CREATE TYPE "GapSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "GapDisposition" AS ENUM ('PENDING', 'GAP_CONFIRMED', 'COVERED_ELSEWHERE', 'NOT_APPLICABLE', 'REMEDIATION_ADDED', 'WONT_FIX');

-- GovernanceReview: Main analysis results for a document
CREATE TABLE "governance_reviews" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    -- Document Reference
    "document_id" TEXT,
    "plan_name" TEXT NOT NULL,
    "plan_type" TEXT,
    "jurisdiction" TEXT NOT NULL DEFAULT 'DEFAULT',

    -- Analysis Results
    "coverage_score" DOUBLE PRECISION NOT NULL,
    "liability_score" DOUBLE PRECISION NOT NULL,
    "total_policies" INTEGER NOT NULL,
    "total_gaps" INTEGER NOT NULL,

    -- Gap Summary by Status
    "evidenced" INTEGER NOT NULL DEFAULT 0,
    "partial" INTEGER NOT NULL DEFAULT 0,
    "not_evidenced" INTEGER NOT NULL DEFAULT 0,

    -- AI Validation Summary
    "ai_validated" BOOLEAN NOT NULL DEFAULT false,
    "ai_confirmed_gaps" INTEGER NOT NULL DEFAULT 0,
    "ai_false_positives" INTEGER NOT NULL DEFAULT 0,
    "avg_ai_confidence" DOUBLE PRECISION,

    -- Report Generation
    "html_report" TEXT,
    "pdf_report_url" TEXT,

    -- Organization Context
    "organization_name" TEXT,
    "organization_state" TEXT,

    -- Risk Triggers (JSON array)
    "risk_triggers" JSONB,

    -- Raw Analysis Data
    "raw_analysis" JSONB,

    -- Audit
    "analyzed_by" TEXT,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    -- Demo flag
    "is_demo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "governance_reviews_pkey" PRIMARY KEY ("id")
);

-- GovernanceGap: Individual gap findings with AI validation
CREATE TABLE "governance_gaps" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,

    -- Policy Reference
    "policy_code" TEXT NOT NULL,
    "policy_name" TEXT NOT NULL,
    "policy_category" TEXT,
    "requirement_id" TEXT,
    "requirement_name" TEXT,

    -- Detection Results
    "finding" "GapFinding" NOT NULL,
    "severity" "GapSeverity" NOT NULL,
    "evidence" JSONB,
    "missing_elements" JSONB,

    -- AI Validation
    "ai_validated" BOOLEAN NOT NULL DEFAULT false,
    "ai_is_gap" BOOLEAN,
    "ai_confidence" INTEGER,
    "ai_reasoning" TEXT,
    "ai_suggested_grade" TEXT,
    "ai_validated_at" TIMESTAMP(3),

    -- Remediation
    "remediation_generated" BOOLEAN NOT NULL DEFAULT false,
    "remediation_text" TEXT,
    "remediation_insertion_point" TEXT,
    "remediation_integration_notes" TEXT,
    "remediation_conflict_warnings" JSONB,
    "remediation_confidence" INTEGER,
    "remediation_generated_at" TIMESTAMP(3),

    -- User Disposition
    "disposition" "GapDisposition" NOT NULL DEFAULT 'PENDING',
    "disposition_notes" TEXT,
    "disposition_by" TEXT,
    "disposition_at" TIMESTAMP(3),

    -- Audit
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "governance_gaps_pkey" PRIMARY KEY ("id")
);

-- GovernanceConversation: Chat history with The Toddfather
CREATE TABLE "governance_conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    -- Optional Review Context
    "review_id" TEXT,

    -- AICR Conversation Reference
    "aicr_conversation_id" TEXT NOT NULL,

    -- Context at conversation start
    "context_snapshot" JSONB,

    -- Message Count
    "message_count" INTEGER NOT NULL DEFAULT 0,

    -- User
    "user_id" TEXT,

    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "governance_conversations_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "governance_gaps" ADD CONSTRAINT "governance_gaps_review_id_fkey"
    FOREIGN KEY ("review_id") REFERENCES "governance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "governance_conversations" ADD CONSTRAINT "governance_conversations_review_id_fkey"
    FOREIGN KEY ("review_id") REFERENCES "governance_reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for governance_reviews
CREATE INDEX "governance_reviews_tenant_id_idx" ON "governance_reviews"("tenant_id");
CREATE INDEX "governance_reviews_document_id_idx" ON "governance_reviews"("document_id");
CREATE INDEX "governance_reviews_analyzed_at_idx" ON "governance_reviews"("analyzed_at");
CREATE INDEX "governance_reviews_coverage_score_idx" ON "governance_reviews"("coverage_score");
CREATE INDEX "governance_reviews_is_demo_idx" ON "governance_reviews"("is_demo");

-- Indexes for governance_gaps
CREATE INDEX "governance_gaps_review_id_idx" ON "governance_gaps"("review_id");
CREATE INDEX "governance_gaps_policy_code_idx" ON "governance_gaps"("policy_code");
CREATE INDEX "governance_gaps_finding_idx" ON "governance_gaps"("finding");
CREATE INDEX "governance_gaps_severity_idx" ON "governance_gaps"("severity");
CREATE INDEX "governance_gaps_ai_validated_idx" ON "governance_gaps"("ai_validated");
CREATE INDEX "governance_gaps_disposition_idx" ON "governance_gaps"("disposition");

-- Indexes for governance_conversations
CREATE INDEX "governance_conversations_tenant_id_idx" ON "governance_conversations"("tenant_id");
CREATE INDEX "governance_conversations_review_id_idx" ON "governance_conversations"("review_id");
CREATE INDEX "governance_conversations_aicr_conversation_id_idx" ON "governance_conversations"("aicr_conversation_id");
CREATE INDEX "governance_conversations_last_message_at_idx" ON "governance_conversations"("last_message_at");
