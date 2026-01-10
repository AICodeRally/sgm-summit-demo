-- AlterTable
ALTER TABLE "plan_sections" ADD COLUMN "content_json" JSONB;

-- CreateTable
CREATE TABLE "uploaded_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsed_content" JSONB,
    "parsed_at" DATETIME,
    "total_sections" INTEGER,
    "total_words" INTEGER,
    "processing_time" INTEGER,
    "plan_id" TEXT,
    "error_message" TEXT
);

-- CreateTable
CREATE TABLE "section_mappings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "document_id" TEXT NOT NULL,
    "detected_title" TEXT NOT NULL,
    "detected_content" JSONB NOT NULL,
    "template_section_id" TEXT NOT NULL,
    "template_section_key" TEXT NOT NULL,
    "template_section_title" TEXT NOT NULL,
    "confidence_score" REAL NOT NULL,
    "mapping_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "alternatives" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" DATETIME,
    CONSTRAINT "section_mappings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "uploaded_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "policy_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "document_id" TEXT,
    "plan_id" TEXT,
    "gap_id" TEXT,
    "policy_code" TEXT NOT NULL,
    "policy_data" JSONB NOT NULL,
    "recommendation_details" JSONB NOT NULL,
    "priority" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "applied_at" DATETIME,
    "applied_by" TEXT,
    "application_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "policy_recommendations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "uploaded_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "uploaded_documents_tenant_id_status_idx" ON "uploaded_documents"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "uploaded_documents_uploaded_by_idx" ON "uploaded_documents"("uploaded_by");

-- CreateIndex
CREATE INDEX "uploaded_documents_uploaded_at_idx" ON "uploaded_documents"("uploaded_at");

-- CreateIndex
CREATE INDEX "section_mappings_document_id_idx" ON "section_mappings"("document_id");

-- CreateIndex
CREATE INDEX "section_mappings_status_idx" ON "section_mappings"("status");

-- CreateIndex
CREATE INDEX "section_mappings_confidence_score_idx" ON "section_mappings"("confidence_score");

-- CreateIndex
CREATE INDEX "policy_recommendations_document_id_idx" ON "policy_recommendations"("document_id");

-- CreateIndex
CREATE INDEX "policy_recommendations_plan_id_status_idx" ON "policy_recommendations"("plan_id", "status");

-- CreateIndex
CREATE INDEX "policy_recommendations_policy_code_idx" ON "policy_recommendations"("policy_code");

-- CreateIndex
CREATE INDEX "policy_recommendations_priority_idx" ON "policy_recommendations"("priority");
