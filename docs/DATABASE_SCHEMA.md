# Database Schema Specification — AnimateLab (Final Phase 2 Amendments)

Complete relational SQLite schema definition supporting **CaptureSessions**, **Configurable Budgets**, and **6-Stage Component Extraction Lifecycle**.

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./app.db"
}

generator client {
  provider = "prisma-client-js"
}

// ------------------------------------------------------
// WORKSPACE & WEBSITE ROOT
// ------------------------------------------------------

model Workspace {
  id          String    @id @default(uuid())
  name        String
  storagePath String    @unique
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  websites    Website[]
}

model Website {
  id                 String              @id @default(uuid())
  workspaceId        String
  workspace          Workspace           @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name               String
  url                String
  description        String?
  status             String              @default("queued")
  faviconUrl         String?
  previewScreenshot  String?
  storagePath        String
  totalPages         Int                 @default(0)
  totalSections      Int                 @default(0)
  totalComponents    Int                 @default(0)
  totalAnimations    Int                 @default(0)
  total3D            Int                 @default(0)
  totalResources     Int                 @default(0)
  totalStorageBytes  BigInt              @default(0)
  provenanceNotes    String?
  createdAt          DateTime            @default(now())
  lastAnalyzedAt     DateTime            @default(now())

  captureSessions    CaptureSession[]
  jobs               CaptureJob[]
  pages              Page[]
  sections           Section[]
  componentCandidates ComponentCandidate[]
  animations         Animation[]
  threeDExperiences  ThreeDExperience[]
  resources          Resource[]
  assets             Asset[]
  diagnosticLogs     DiagnosticLog[]
  technologyEvidence TechnologyEvidence[]
  tags               WebsiteTag[]

  @@index([status])
  @@index([url])
}

// ------------------------------------------------------
// CAPTURE SESSION & CONFIGURATION
// ------------------------------------------------------

model CaptureSession {
  id                  String       @id @default(uuid())
  websiteId           String
  website             Website      @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  jobId               String?
  job                 CaptureJob?  @relation(fields: [jobId], references: [id], onDelete: SetNull)
  sessionVersion      Int          @default(1)
  profilePreset       String       @default("standard") // quick | standard | 3d-heavy | custom
  userAgent           String
  headersJson         String?      // Custom HTTP headers
  cookiesPath         String?      // Local JSON path for cookies
  localStoragePath    String?      // Local JSON path for localStorage
  sessionStoragePath  String?      // Local JSON path for sessionStorage
  configJson          String       // Full CaptureConfig JSON
  status              String       @default("running") // running | completed | partial | failed | canceled
  startedAt           DateTime     @default(now())
  endedAt             DateTime?

  pages               Page[]

  @@index([websiteId])
}

model CaptureJob {
  id                          String           @id @default(uuid())
  websiteId                   String
  website                     Website          @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  websiteName                 String
  websiteUrl                  String
  captureVersion              Int              @default(1)
  profilePreset               String           @default("standard")
  status                      String           @default("queued")
  progressPagesCompleted     Int              @default(0)
  progressPagesTotal          Int              @default(0)
  capturedResourcesCount      Int              @default(0)
  discoveredAnimationsCount  Int              @default(0)
  discoveredSectionsCount    Int              @default(0)
  extractedComponentsCount    Int              @default(0)
  currentAction               String
  currentPageUrl              String?
  startTime                   DateTime         @default(now())
  endTime                     DateTime?
  warningsCount               Int              @default(0)
  errorsCount                 Int              @default(0)

  sessions                    CaptureSession[]
  steps                       CaptureStep[]
  logs                        DiagnosticLog[]

  @@index([websiteId])
}

// ------------------------------------------------------
// PAGE & SECTION HIERARCHY
// ------------------------------------------------------

model Page {
  id                String          @id @default(uuid())
  websiteId         String
  website           Website         @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  sessionId         String?
  session           CaptureSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  url               String
  path              String
  title             String
  screenshot        String?
  status            String          @default("pending")
  httpStatusCode    Int             @default(200)
  resourceCount     Int             @default(0)
  sectionCount      Int             @default(0)
  componentCount    Int             @default(0)
  animationCount    Int             @default(0)
  threeDCount       Int             @default(0)
  errorMessage      String?
  createdAt         DateTime        @default(now())
  lastAnalyzedAt    DateTime        @default(now())

  sections          Section[]
  componentCandidates ComponentCandidate[]
  animations        Animation[]
  threeDExperiences ThreeDExperience[]
  pageResources     PageResource[]
  resources         Resource[]
  assets            Asset[]

  @@index([websiteId])
  @@index([sessionId])
}

model Section {
  id                   String              @id @default(uuid())
  websiteId            String
  website              Website             @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId               String
  page                 Page                @relation(fields: [pageId], references: [id], onDelete: Cascade)
  title                String
  category             String
  domSelector          String
  domTagName           String
  boundsX              Float
  boundsY              Float
  boundsWidth          Float
  boundsHeight         Float
  boundsViewportRatio  Float
  previewScreenshot    String?
  status               String              @default("completed")
  isComponentCandidate Boolean             @default(false)
  createdAt            DateTime            @default(now())

  componentCandidate   ComponentCandidate?

  @@index([pageId])
}

// ------------------------------------------------------
// EXTENDED 6-STAGE COMPONENT CANDIDATE LIFECYCLE
// ------------------------------------------------------

model ComponentCandidate {
  id                   String              @id @default(uuid())
  websiteId            String
  website              Website             @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId               String
  page                 Page                @relation(fields: [pageId], references: [id], onDelete: Cascade)
  sectionId            String?             @unique
  section              Section?            @relation(fields: [sectionId], references: [id], onDelete: SetNull)
  title                String
  category             String
  description          String
  status               String              @default("candidate") // candidate | verified | exported
  extractionStage      String              @default("IDENTIFIED") // IDENTIFIED | ISOLATED | NORMALIZED | GENERATED | VALIDATED | EXPORTED
  captureVersion       Int                 @default(1)
  previewUrl           String?
  previewType          String              @default("screenshot")
  originalHtml         String?
  originalCss          String?
  originalJs           String?
  normalizedHtml       String?
  normalizedCss        String?
  normalizedJs         String?
  generatedReactTsx    String?
  dependenciesJson     String?
  licensingNotes       String?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  evidence             ComponentEvidence?
  reusableComponent    ReusableComponent?
  animations           ComponentAnimation[]
  assets               Asset[]
  componentResources   ComponentResource[]
  componentTechnologies ComponentTechnology[]
  tags                 ComponentTag[]

  @@index([websiteId])
  @@index([extractionStage])
}

model ComponentEvidence {
  id                     String             @id @default(uuid())
  componentCandidateId   String             @unique
  componentCandidate     ComponentCandidate @relation(fields: [componentCandidateId], references: [id], onDelete: Cascade)
  domStructureScore      Float
  animationCount         Int
  interactiveBehaviors   String
  associatedAssetsCount  Int
  detectedTechnologies   String
  visualCharacteristics  String
  confidenceScore        Float
}

model ComponentTag {
  componentId String
  tagId       String
  component   ComponentCandidate @relation(fields: [componentId], references: [id], onDelete: Cascade)
  tag         Tag                @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([componentId, tagId])
}

model ReusableComponent {
  id                   String             @id @default(uuid())
  candidateId          String             @unique
  candidate            ComponentCandidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  title                String
  category             String
  reactCode            String
  cssCode              String
  propsDocJson         String
  exportFormat         String             @default("react_tailwind")
  version              String             @default("1.0.0")
  exportedAt           DateTime           @default(now())
}

// ------------------------------------------------------
// RESOURCE IDENTITY & DUAL-PATH ACQUISITION
// ------------------------------------------------------

model Resource {
  id                String              @id @default(uuid())
  websiteId         String
  website           Website             @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId            String
  page              Page                @relation(fields: [pageId], references: [id], onDelete: Cascade)
  originalUrl       String              // Preserves exact original URL with query params
  canonicalUrl      String              // Normalized URL (query params stripped for indexing)
  contentHash       String              // SHA-256 hash for physical deduplication
  localPath         String              // Physical file path on disk
  mimeType          String
  sizeBytes         BigInt
  acquisitionPath   String              @default("browser_buffer") // browser_buffer | streaming_http | metadata_only
  status            String              @default("completed") // completed | partial | failed
  resourceType      String
  capturedAt        DateTime            @default(now())
  contentSnippet    String?

  pageResources     PageResource[]
  componentResources ComponentResource[]
  assets            Asset[]

  @@index([contentHash])
  @@index([originalUrl])
}

// ------------------------------------------------------
// TAGS, ASSETS, ANIMATIONS, 3D, TECH, LOGS
// ------------------------------------------------------

model Tag {
  id        String       @id @default(uuid())
  name      String       @unique
  websites  WebsiteTag[]
  components ComponentTag[]
}

model WebsiteTag {
  websiteId String
  tagId     String
  website   Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([websiteId, tagId])
}

model PageResource {
  pageId     String
  resourceId String
  page       Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  resource   Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@id([pageId, resourceId])
}

model ComponentResource {
  componentId String
  resourceId  String
  component   ComponentCandidate @relation(fields: [componentId], references: [id], onDelete: Cascade)
  resource    Resource           @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@id([componentId, resourceId])
}

model Asset {
  id                    String              @id @default(uuid())
  websiteId             String
  website               Website             @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId                String?
  page                  Page?               @relation(fields: [pageId], references: [id], onDelete: SetNull)
  resourceId            String?
  resource              Resource?           @relation(fields: [resourceId], references: [id], onDelete: SetNull)
  componentCandidateId  String?
  componentCandidate    ComponentCandidate? @relation(fields: [componentCandidateId], references: [id], onDelete: SetNull)
  title                 String
  type                  String
  dimensions            String?
  fileSizeBytes         BigInt
  mimeType              String
  localPath             String
  sourceUrl             String
  previewUrl            String
  createdAt             DateTime            @default(now())

  @@index([websiteId])
}

model Animation {
  id                   String              @id @default(uuid())
  websiteId            String
  website              Website             @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId               String
  page                 Page                @relation(fields: [pageId], references: [id], onDelete: Cascade)
  name                 String
  type                 String
  library              String
  affectedElements     String
  durationMs           Int
  delayMs              Int
  easing               String
  trigger              String
  animatedProperties   String
  codeSnippet          String
  createdAt            DateTime            @default(now())

  evidence             AnimationEvidence?
  componentAnimations  ComponentAnimation[]

  @@index([pageId])
}

model AnimationEvidence {
  id                String    @id @default(uuid())
  animationId       String    @unique
  animation         Animation @relation(fields: [animationId], references: [id], onDelete: Cascade)
  runtimeEvidence   String
  domEvidence       String
  scriptEvidence    String
  networkEvidence   String?
  confidence        Float
}

model ComponentAnimation {
  componentId String
  animationId String
  component   ComponentCandidate @relation(fields: [componentId], references: [id], onDelete: Cascade)
  animation   Animation          @relation(fields: [animationId], references: [id], onDelete: Cascade)

  @@id([componentId, animationId])
}

model ThreeDExperience {
  id                String    @id @default(uuid())
  websiteId         String
  website           Website   @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId            String
  page              Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  title             String
  type              String
  canvasCount       Int
  webGlContextType  String
  fpsEstimate       Float
  shaderCount       Int
  modelCount        Int
  textureCount      Int
  modelsJson        String
  texturesJson      String
  shaderSnippetsJson String
  status            String    @default("completed")
  statusNotes       String
  previewImage      String?
  createdAt         DateTime  @default(now())

  @@index([websiteId])
}

model Technology {
  id                   String                @id @default(uuid())
  name                 String                @unique
  category             String
  version              String?
  iconName             String
  description          String
  websiteCount         Int                   @default(0)
  componentCount       Int                   @default(0)

  evidence             TechnologyEvidence[]
  componentTechnologies ComponentTechnology[]
}

model TechnologyEvidence {
  id           String     @id @default(uuid())
  technologyId String
  technology   Technology @relation(fields: [technologyId], references: [id], onDelete: Cascade)
  websiteId    String
  website      Website    @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  pageId       String?
  source       String
  evidenceType String
  evidenceValue String
  confidence   Float
  detectedAt   DateTime   @default(now())

  @@index([technologyId])
}

model ComponentTechnology {
  componentId  String
  technologyId String
  component    ComponentCandidate @relation(fields: [componentId], references: [id], onDelete: Cascade)
  technology   Technology         @relation(fields: [technologyId], references: [id], onDelete: Cascade)

  @@id([componentId, technologyId])
}

model CaptureStep {
  id          String     @id @default(uuid())
  jobId       String
  job         CaptureJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  stepName    String
  status      String     @default("queued")
  startTime   DateTime   @default(now())
  endTime     DateTime?
  details     String?

  @@index([jobId])
}

model DiagnosticLog {
  id          String      @id @default(uuid())
  jobId       String?
  job         CaptureJob? @relation(fields: [jobId], references: [id], onDelete: SetNull)
  websiteId   String
  website     Website     @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  timestamp   DateTime    @default(now())
  level       String
  module      String
  message     String
  details     String?

  @@index([websiteId])
}
```
