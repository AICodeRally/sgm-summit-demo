-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expires_at" DATETIME
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "tenant_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "effective_date" DATETIME NOT NULL,
    "expiration_date" DATETIME,
    "content" TEXT NOT NULL,
    "parent_policy_id" TEXT,
    "superseded_by_policy_id" TEXT,
    "approval_required" BOOLEAN NOT NULL DEFAULT true,
    "approval_workflow_id" TEXT,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" DATETIME,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "territories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "parent_territory_id" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "assigned_to_user_id" TEXT,
    "assigned_at" DATETIME,
    "coverage_rules" JSONB,
    "effective_date" DATETIME NOT NULL,
    "expiration_date" DATETIME,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" DATETIME,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "territories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "document_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "document_type" TEXT NOT NULL,
    "category" TEXT,
    "tags" JSONB NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" DATETIME NOT NULL,
    "effective_date" DATETIME,
    "expiration_date" DATETIME,
    "next_review" DATETIME,
    "file_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "checksum" TEXT,
    "owner" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "approvers" JSONB,
    "approval_workflow_id" TEXT,
    "legal_review_status" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "related_docs" JSONB NOT NULL,
    "referenced_by" JSONB NOT NULL,
    "supersedes" TEXT,
    "superseded_by" TEXT,
    "retention_period" INTEGER NOT NULL DEFAULT 7,
    "compliance_flags" JSONB NOT NULL,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "request_data" JSONB NOT NULL,
    "workflow_id" TEXT,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL DEFAULT 1,
    "submitted_by" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sla_deadline" DATETIME,
    "escalated_at" DATETIME,
    "decided_by" TEXT,
    "decided_at" DATETIME,
    "decision" TEXT,
    "decision_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "approvals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT,
    "actor_role" TEXT,
    "changes_before" JSONB,
    "changes_after" JSONB,
    "request_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "occurred_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "committees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "charter" TEXT,
    "meeting_frequency" TEXT,
    "quorum_requirement" INTEGER,
    "voting_members" JSONB,
    "non_voting_members" JSONB,
    "advisors" JSONB,
    "approval_authority" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "committees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "case_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "case_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assigned_to" TEXT,
    "committee_id" TEXT,
    "submitted_by" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financial_impact" DECIMAL,
    "financial_impact_type" TEXT,
    "resolved_by" TEXT,
    "resolved_at" DATETIME,
    "resolution" TEXT,
    "sla_deadline" DATETIME,
    "business_days_used" INTEGER,
    "is_overdue" BOOLEAN NOT NULL DEFAULT false,
    "timeline" JSONB,
    "attachments" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "cases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plan_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plan_type" TEXT NOT NULL,
    "category" TEXT,
    "tags" JSONB NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "is_system_template" BOOLEAN NOT NULL DEFAULT false,
    "cloned_from_id" TEXT,
    "owner" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" DATETIME NOT NULL,
    "effective_date" DATETIME,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "plan_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "template_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_id" TEXT NOT NULL,
    "parent_section_id" TEXT,
    "section_key" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "order_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_repeatable" BOOLEAN NOT NULL DEFAULT false,
    "content_template" TEXT,
    "field_definitions" JSONB,
    "ai_agent_roles" JSONB NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "template_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "plan_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "plan_type" TEXT NOT NULL,
    "category" TEXT,
    "tags" JSONB NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_from_template_id" TEXT,
    "template_snapshot" JSONB,
    "owner" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "approval_workflow_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" DATETIME NOT NULL,
    "effective_date" DATETIME,
    "expiration_date" DATETIME,
    "published_at" DATETIME,
    "document_id" TEXT,
    "supersedes" TEXT,
    "superseded_by" TEXT,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "sections_completed" INTEGER NOT NULL DEFAULT 0,
    "sections_total" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "demo_metadata" JSONB,
    CONSTRAINT "plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plans_created_from_template_id_fkey" FOREIGN KEY ("created_from_template_id") REFERENCES "plan_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plan_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plan_id" TEXT NOT NULL,
    "parent_section_id" TEXT,
    "section_key" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "order_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "field_values" JSONB,
    "ai_agent_roles" JSONB NOT NULL,
    "completion_status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "reviewed_by" TEXT,
    "reviewed_at" DATETIME,
    "review_comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" DATETIME NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "plan_sections_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "governance_frameworks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "applicable_to" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "governance_frameworks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_tier_idx" ON "tenants"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "policies_tenant_id_idx" ON "policies"("tenant_id");

-- CreateIndex
CREATE INDEX "policies_status_idx" ON "policies"("status");

-- CreateIndex
CREATE INDEX "policies_effective_date_idx" ON "policies"("effective_date");

-- CreateIndex
CREATE INDEX "policies_is_demo_idx" ON "policies"("is_demo");

-- CreateIndex
CREATE INDEX "territories_tenant_id_idx" ON "territories"("tenant_id");

-- CreateIndex
CREATE INDEX "territories_status_idx" ON "territories"("status");

-- CreateIndex
CREATE INDEX "territories_type_idx" ON "territories"("type");

-- CreateIndex
CREATE INDEX "territories_parent_territory_id_idx" ON "territories"("parent_territory_id");

-- CreateIndex
CREATE INDEX "territories_is_demo_idx" ON "territories"("is_demo");

-- CreateIndex
CREATE INDEX "documents_tenant_id_idx" ON "documents"("tenant_id");

-- CreateIndex
CREATE INDEX "documents_document_type_idx" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_is_demo_idx" ON "documents"("is_demo");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenant_id_document_code_key" ON "documents"("tenant_id", "document_code");

-- CreateIndex
CREATE INDEX "approvals_tenant_id_idx" ON "approvals"("tenant_id");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "approvals_entity_type_entity_id_idx" ON "approvals"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approvals_is_demo_idx" ON "approvals"("is_demo");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs"("event_type");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_occurred_at_idx" ON "audit_logs"("occurred_at");

-- CreateIndex
CREATE INDEX "committees_tenant_id_idx" ON "committees"("tenant_id");

-- CreateIndex
CREATE INDEX "committees_type_idx" ON "committees"("type");

-- CreateIndex
CREATE INDEX "committees_status_idx" ON "committees"("status");

-- CreateIndex
CREATE INDEX "committees_is_demo_idx" ON "committees"("is_demo");

-- CreateIndex
CREATE UNIQUE INDEX "committees_tenant_id_code_key" ON "committees"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "cases_case_number_key" ON "cases"("case_number");

-- CreateIndex
CREATE INDEX "cases_tenant_id_idx" ON "cases"("tenant_id");

-- CreateIndex
CREATE INDEX "cases_case_type_idx" ON "cases"("case_type");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "cases_assigned_to_idx" ON "cases"("assigned_to");

-- CreateIndex
CREATE INDEX "cases_submitted_at_idx" ON "cases"("submitted_at");

-- CreateIndex
CREATE INDEX "cases_is_demo_idx" ON "cases"("is_demo");

-- CreateIndex
CREATE UNIQUE INDEX "plan_templates_code_key" ON "plan_templates"("code");

-- CreateIndex
CREATE INDEX "plan_templates_tenant_id_idx" ON "plan_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "plan_templates_plan_type_idx" ON "plan_templates"("plan_type");

-- CreateIndex
CREATE INDEX "plan_templates_status_idx" ON "plan_templates"("status");

-- CreateIndex
CREATE INDEX "plan_templates_is_system_template_idx" ON "plan_templates"("is_system_template");

-- CreateIndex
CREATE INDEX "plan_templates_is_demo_idx" ON "plan_templates"("is_demo");

-- CreateIndex
CREATE INDEX "template_sections_template_id_idx" ON "template_sections"("template_id");

-- CreateIndex
CREATE INDEX "template_sections_parent_section_id_idx" ON "template_sections"("parent_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_plan_code_key" ON "plans"("plan_code");

-- CreateIndex
CREATE INDEX "plans_tenant_id_idx" ON "plans"("tenant_id");

-- CreateIndex
CREATE INDEX "plans_plan_type_idx" ON "plans"("plan_type");

-- CreateIndex
CREATE INDEX "plans_status_idx" ON "plans"("status");

-- CreateIndex
CREATE INDEX "plans_owner_idx" ON "plans"("owner");

-- CreateIndex
CREATE INDEX "plans_created_from_template_id_idx" ON "plans"("created_from_template_id");

-- CreateIndex
CREATE INDEX "plans_is_demo_idx" ON "plans"("is_demo");

-- CreateIndex
CREATE INDEX "plan_sections_plan_id_idx" ON "plan_sections"("plan_id");

-- CreateIndex
CREATE INDEX "plan_sections_parent_section_id_idx" ON "plan_sections"("parent_section_id");

-- CreateIndex
CREATE INDEX "plan_sections_completion_status_idx" ON "plan_sections"("completion_status");

-- CreateIndex
CREATE UNIQUE INDEX "governance_frameworks_code_key" ON "governance_frameworks"("code");

-- CreateIndex
CREATE INDEX "governance_frameworks_tenant_id_idx" ON "governance_frameworks"("tenant_id");

-- CreateIndex
CREATE INDEX "governance_frameworks_category_idx" ON "governance_frameworks"("category");

-- CreateIndex
CREATE INDEX "governance_frameworks_status_idx" ON "governance_frameworks"("status");

-- CreateIndex
CREATE INDEX "governance_frameworks_is_global_idx" ON "governance_frameworks"("is_global");
