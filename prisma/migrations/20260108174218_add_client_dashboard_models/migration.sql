-- CreateTable
CREATE TABLE "client_engagements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "target_end_date" DATETIME,
    "actual_end_date" DATETIME,
    "consultant_team" JSONB NOT NULL,
    "client_contacts" JSONB NOT NULL,
    "branding_config" JSONB,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "client_engagements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_plan_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagement_id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plan_type" TEXT,
    "business_unit" TEXT,
    "coverage_full" INTEGER NOT NULL,
    "coverage_limited" INTEGER NOT NULL,
    "coverage_no" INTEGER NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "policy_coverage" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "client_plan_analyses_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "client_engagements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_gap_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagement_id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "policy_area" TEXT NOT NULL,
    "gap_description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bhg_policy_ref" TEXT,
    "assigned_to" TEXT,
    "due_date" DATETIME,
    "resolved_by" TEXT,
    "resolved_at" DATETIME,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "client_gap_analyses_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "client_engagements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_roadmap_phases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagement_id" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "milestones" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "completion_pct" INTEGER NOT NULL DEFAULT 0,
    "start_date" DATETIME,
    "target_end_date" DATETIME,
    "actual_end_date" DATETIME,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "client_roadmap_phases_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "client_engagements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "client_engagements_tenant_id_key" ON "client_engagements"("tenant_id");

-- CreateIndex
CREATE INDEX "client_engagements_status_idx" ON "client_engagements"("status");

-- CreateIndex
CREATE INDEX "client_engagements_type_idx" ON "client_engagements"("type");

-- CreateIndex
CREATE INDEX "client_plan_analyses_engagement_id_idx" ON "client_plan_analyses"("engagement_id");

-- CreateIndex
CREATE INDEX "client_plan_analyses_plan_code_idx" ON "client_plan_analyses"("plan_code");

-- CreateIndex
CREATE UNIQUE INDEX "client_plan_analyses_engagement_id_plan_code_key" ON "client_plan_analyses"("engagement_id", "plan_code");

-- CreateIndex
CREATE INDEX "client_gap_analyses_engagement_id_idx" ON "client_gap_analyses"("engagement_id");

-- CreateIndex
CREATE INDEX "client_gap_analyses_plan_code_idx" ON "client_gap_analyses"("plan_code");

-- CreateIndex
CREATE INDEX "client_gap_analyses_severity_idx" ON "client_gap_analyses"("severity");

-- CreateIndex
CREATE INDEX "client_gap_analyses_status_idx" ON "client_gap_analyses"("status");

-- CreateIndex
CREATE INDEX "client_roadmap_phases_engagement_id_idx" ON "client_roadmap_phases"("engagement_id");

-- CreateIndex
CREATE INDEX "client_roadmap_phases_order_index_idx" ON "client_roadmap_phases"("order_index");

-- CreateIndex
CREATE INDEX "client_roadmap_phases_status_idx" ON "client_roadmap_phases"("status");
