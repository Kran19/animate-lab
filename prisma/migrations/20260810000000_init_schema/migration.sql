-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "faviconUrl" TEXT,
    "previewScreenshot" TEXT,
    "storagePath" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "totalSections" INTEGER NOT NULL DEFAULT 0,
    "totalComponents" INTEGER NOT NULL DEFAULT 0,
    "totalAnimations" INTEGER NOT NULL DEFAULT 0,
    "total3D" INTEGER NOT NULL DEFAULT 0,
    "totalResources" INTEGER NOT NULL DEFAULT 0,
    "totalStorageBytes" BIGINT NOT NULL DEFAULT 0,
    "provenanceNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAnalyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Website_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaptureSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "jobId" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "profilePreset" TEXT NOT NULL DEFAULT 'standard',
    "userAgent" TEXT NOT NULL,
    "headersJson" TEXT,
    "cookiesPath" TEXT,
    "localStoragePath" TEXT,
    "sessionStoragePath" TEXT,
    "configJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    CONSTRAINT "CaptureSession_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaptureSession_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "CaptureJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaptureJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "captureVersion" INTEGER NOT NULL DEFAULT 1,
    "profilePreset" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progressPagesCompleted" INTEGER NOT NULL DEFAULT 0,
    "progressPagesTotal" INTEGER NOT NULL DEFAULT 0,
    "capturedResourcesCount" INTEGER NOT NULL DEFAULT 0,
    "discoveredAnimationsCount" INTEGER NOT NULL DEFAULT 0,
    "discoveredSectionsCount" INTEGER NOT NULL DEFAULT 0,
    "extractedComponentsCount" INTEGER NOT NULL DEFAULT 0,
    "currentAction" TEXT NOT NULL,
    "currentPageUrl" TEXT,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "warningsCount" INTEGER NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CaptureJob_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "sessionId" TEXT,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "screenshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "httpStatusCode" INTEGER NOT NULL DEFAULT 200,
    "resourceCount" INTEGER NOT NULL DEFAULT 0,
    "sectionCount" INTEGER NOT NULL DEFAULT 0,
    "componentCount" INTEGER NOT NULL DEFAULT 0,
    "animationCount" INTEGER NOT NULL DEFAULT 0,
    "threeDCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAnalyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Page_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Page_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CaptureSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "domSelector" TEXT NOT NULL,
    "domTagName" TEXT NOT NULL,
    "boundsX" REAL NOT NULL,
    "boundsY" REAL NOT NULL,
    "boundsWidth" REAL NOT NULL,
    "boundsHeight" REAL NOT NULL,
    "boundsViewportRatio" REAL NOT NULL,
    "previewScreenshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "isComponentCandidate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Section_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Section_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComponentCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'candidate',
    "extractionStage" TEXT NOT NULL DEFAULT 'IDENTIFIED',
    "captureVersion" INTEGER NOT NULL DEFAULT 1,
    "previewUrl" TEXT,
    "previewType" TEXT NOT NULL DEFAULT 'screenshot',
    "originalHtml" TEXT,
    "originalCss" TEXT,
    "originalJs" TEXT,
    "normalizedHtml" TEXT,
    "normalizedCss" TEXT,
    "normalizedJs" TEXT,
    "generatedReactTsx" TEXT,
    "dependenciesJson" TEXT,
    "licensingNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComponentCandidate_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentCandidate_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentCandidate_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComponentEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentCandidateId" TEXT NOT NULL,
    "domStructureScore" REAL NOT NULL,
    "animationCount" INTEGER NOT NULL,
    "interactiveBehaviors" TEXT NOT NULL,
    "associatedAssetsCount" INTEGER NOT NULL,
    "detectedTechnologies" TEXT NOT NULL,
    "visualCharacteristics" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL,
    CONSTRAINT "ComponentEvidence_componentCandidateId_fkey" FOREIGN KEY ("componentCandidateId") REFERENCES "ComponentCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComponentTag" (
    "componentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("componentId", "tagId"),
    CONSTRAINT "ComponentTag_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ComponentCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReusableComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reactCode" TEXT NOT NULL,
    "cssCode" TEXT NOT NULL,
    "propsDocJson" TEXT NOT NULL,
    "exportFormat" TEXT NOT NULL DEFAULT 'react_tailwind',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "exportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReusableComponent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ComponentCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "acquisitionPath" TEXT NOT NULL DEFAULT 'browser_buffer',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "resourceType" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentSnippet" TEXT,
    CONSTRAINT "Resource_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resource_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WebsiteTag" (
    "websiteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("websiteId", "tagId"),
    CONSTRAINT "WebsiteTag_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WebsiteTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageResource" (
    "pageId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    PRIMARY KEY ("pageId", "resourceId"),
    CONSTRAINT "PageResource_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PageResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComponentResource" (
    "componentId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    PRIMARY KEY ("componentId", "resourceId"),
    CONSTRAINT "ComponentResource_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ComponentCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT,
    "resourceId" TEXT,
    "componentCandidateId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dimensions" TEXT,
    "fileSizeBytes" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asset_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Asset_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_componentCandidateId_fkey" FOREIGN KEY ("componentCandidateId") REFERENCES "ComponentCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Animation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "library" TEXT NOT NULL,
    "affectedElements" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "delayMs" INTEGER NOT NULL,
    "easing" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "animatedProperties" TEXT NOT NULL,
    "codeSnippet" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Animation_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Animation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnimationEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "animationId" TEXT NOT NULL,
    "runtimeEvidence" TEXT NOT NULL,
    "domEvidence" TEXT NOT NULL,
    "scriptEvidence" TEXT NOT NULL,
    "networkEvidence" TEXT,
    "confidence" REAL NOT NULL,
    CONSTRAINT "AnimationEvidence_animationId_fkey" FOREIGN KEY ("animationId") REFERENCES "Animation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComponentAnimation" (
    "componentId" TEXT NOT NULL,
    "animationId" TEXT NOT NULL,

    PRIMARY KEY ("componentId", "animationId"),
    CONSTRAINT "ComponentAnimation_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ComponentCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentAnimation_animationId_fkey" FOREIGN KEY ("animationId") REFERENCES "Animation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThreeDExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "canvasCount" INTEGER NOT NULL,
    "webGlContextType" TEXT NOT NULL,
    "fpsEstimate" REAL NOT NULL,
    "shaderCount" INTEGER NOT NULL,
    "modelCount" INTEGER NOT NULL,
    "textureCount" INTEGER NOT NULL,
    "modelsJson" TEXT NOT NULL,
    "texturesJson" TEXT NOT NULL,
    "shaderSnippetsJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "statusNotes" TEXT NOT NULL,
    "previewImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThreeDExperience_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ThreeDExperience_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT,
    "iconName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "websiteCount" INTEGER NOT NULL DEFAULT 0,
    "componentCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "TechnologyEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "technologyId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT,
    "source" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "evidenceValue" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TechnologyEvidence_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechnologyEvidence_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComponentTechnology" (
    "componentId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,

    PRIMARY KEY ("componentId", "technologyId"),
    CONSTRAINT "ComponentTechnology_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ComponentCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaptureStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "details" TEXT,
    CONSTRAINT "CaptureStep_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "CaptureJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiagnosticLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT,
    "websiteId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    CONSTRAINT "DiagnosticLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "CaptureJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DiagnosticLog_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_storagePath_key" ON "Workspace"("storagePath");

-- CreateIndex
CREATE INDEX "Website_status_idx" ON "Website"("status");

-- CreateIndex
CREATE INDEX "Website_url_idx" ON "Website"("url");

-- CreateIndex
CREATE INDEX "CaptureSession_websiteId_idx" ON "CaptureSession"("websiteId");

-- CreateIndex
CREATE INDEX "CaptureJob_websiteId_idx" ON "CaptureJob"("websiteId");

-- CreateIndex
CREATE INDEX "CaptureJob_status_idx" ON "CaptureJob"("status");

-- CreateIndex
CREATE INDEX "Page_websiteId_idx" ON "Page"("websiteId");

-- CreateIndex
CREATE INDEX "Page_sessionId_idx" ON "Page"("sessionId");

-- CreateIndex
CREATE INDEX "Section_pageId_idx" ON "Section"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentCandidate_sectionId_key" ON "ComponentCandidate"("sectionId");

-- CreateIndex
CREATE INDEX "ComponentCandidate_websiteId_idx" ON "ComponentCandidate"("websiteId");

-- CreateIndex
CREATE INDEX "ComponentCandidate_extractionStage_idx" ON "ComponentCandidate"("extractionStage");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentEvidence_componentCandidateId_key" ON "ComponentEvidence"("componentCandidateId");

-- CreateIndex
CREATE UNIQUE INDEX "ReusableComponent_candidateId_key" ON "ReusableComponent"("candidateId");

-- CreateIndex
CREATE INDEX "Resource_contentHash_idx" ON "Resource"("contentHash");

-- CreateIndex
CREATE INDEX "Resource_originalUrl_idx" ON "Resource"("originalUrl");

-- CreateIndex
CREATE INDEX "Resource_websiteId_idx" ON "Resource"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Asset_websiteId_idx" ON "Asset"("websiteId");

-- CreateIndex
CREATE INDEX "Animation_pageId_idx" ON "Animation"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimationEvidence_animationId_key" ON "AnimationEvidence"("animationId");

-- CreateIndex
CREATE INDEX "ThreeDExperience_websiteId_idx" ON "ThreeDExperience"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- CreateIndex
CREATE INDEX "TechnologyEvidence_technologyId_idx" ON "TechnologyEvidence"("technologyId");

-- CreateIndex
CREATE INDEX "CaptureStep_jobId_idx" ON "CaptureStep"("jobId");

-- CreateIndex
CREATE INDEX "DiagnosticLog_websiteId_idx" ON "DiagnosticLog"("websiteId");
