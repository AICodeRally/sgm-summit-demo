-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version_number" TEXT NOT NULL,
    "version_label" TEXT,
    "lifecycle_status" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_format" TEXT NOT NULL DEFAULT 'markdown',
    "source_file_url" TEXT,
    "source_file_name" TEXT,
    "source_file_type" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_by" TEXT,
    "modified_at" DATETIME,
    "change_description" TEXT,
    "change_type" TEXT NOT NULL DEFAULT 'MINOR',
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "approval_comments" TEXT,
    "published_by" TEXT,
    "published_at" DATETIME,
    "checksum" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "previous_version_id" TEXT,
    "superseded_by" TEXT,
    "metadata" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE INDEX "document_versions_tenant_id_idx" ON "document_versions"("tenant_id");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "document_versions"("document_id");

-- CreateIndex
CREATE INDEX "document_versions_lifecycle_status_idx" ON "document_versions"("lifecycle_status");

-- CreateIndex
CREATE INDEX "document_versions_created_at_idx" ON "document_versions"("created_at");

-- CreateIndex
CREATE INDEX "document_versions_published_at_idx" ON "document_versions"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_number_key" ON "document_versions"("document_id", "version_number");
