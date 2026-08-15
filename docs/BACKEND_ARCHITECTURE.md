# Backend Architecture Specification — AnimateLab (Final Phase 2 Amendments)

## 1. Executive Summary & Desktop Architecture Choice

AnimateLab is a local-first desktop application designed for website crawling, runtime animation inspection, WebGL 3D analysis, and reusable component candidate extraction.

### Recommended Architecture: **Tauri 2 + Node.js Engine Sidecar + SQLite (Prisma/Better-SQLite3)**

```
+-----------------------------------------------------------------------+
| TAURI 2 DESKTOP SHELL (Rust Core)                                     |
| - Window Management & Native OS Dialogs                               |
| - System Tray & System Permissions                                    |
| - Platform-Independent StorageMonitor Interface                       |
+-----------------------------------------------------------------------+
                                  │
                                  │  IPC (Stdio / WebSockets JSON-RPC)
                                  ▼
+-----------------------------------------------------------------------+
| NODE.JS LOCAL ENGINE SIDECAR (Subprocess Supervisor)                  |
|                                                                       |
| ├── AppBridge Router (JSON-RPC Handler)                               |
| ├── SQLite Engine (Prisma ORM for Relational + FTS5 Worker Thread)    |
| ├── Playwright Browser Worker Pool (Chromium instances)                |
| ├── CaptureSession Manager (BrowserContext, Cookies, StorageState)    |
| ├── Non-Destructive Observational Runtime & 3D Analyzer               |
| └── Component Extraction Lifecycle Engine                             |
+-----------------------------------------------------------------------+
                                  │
                                  ▼
+-----------------------------------------------------------------------+
| LOCAL FILESYSTEM ARCHIVE (D:\WebExperienceLab\)                       |
| ├── database/app.db                                                   |
| ├── websites/website-[id]/ (Captures, Sessions, Pages, Assets)        |
| ├── components/component-[id]/ (Extracted candidates & TSX exports)   |
| └── cache/ (Temporary download buffers)                               |
+-----------------------------------------------------------------------+
```

---

## 2. StorageMonitor Abstraction (Platform-Independent)

To avoid leaking OS-specific APIs (`statfs`, Windows `GetDiskFreeSpaceExW`, Posix `statvfs`) into domain services, storage monitoring is wrapped inside a platform-independent **`StorageMonitor`** interface:

```typescript
export interface StorageMonitor {
  getAvailableBytes(targetPath: string): Promise<bigint>;
  getTotalBytes(targetPath: string): Promise<bigint>;
  getUsedBytes(targetPath: string): Promise<bigint>;
}
```

- Platform-specific native drivers (`WindowsStorageDriver`, `PosixStorageDriver`) implement the interface under `src/engine/storage/drivers/`.

---

## 3. Extended Component Extraction Lifecycle

Component candidates progress through a 6-stage extraction lifecycle:

```
IDENTIFIED
  │  (DOM Section Detector flags visual/interactive region)
  ▼
ISOLATED
  │  (Styles, DOM subtree, and assets isolated into standalone bundle)
  ▼
NORMALIZED
  │  (Class names, vendor prefixes, and scoped CSS cleaned)
  ▼
GENERATED
  │  (React TSX / Tailwind component code emitted)
  ▼
VALIDATED
  │  (Syntax check & preview rendering verified)
  ▼
EXPORTED
  │  (Exported to user component library or disk project)
```

### Distinction Matrix
- **Captured Source**: Raw, unmodified HTML/CSS/JS captured by browser engine.
- **Isolated Section**: Standalone DOM subtree with associated CSS rules and asset paths.
- **Normalized Component**: Cleaned, vendor-prefix-free HTML & CSS structure.
- **Generated Reusable Component**: Final React TSX component with props documentation.

---

## 4. Process Lifecycle, Orphan Detection & Windows Job Objects

- **Explicit Hierarchy**: Tauri Rust Host → Node Engine Sidecar → Playwright Master Worker → Chromium Main → Chromium Child Renderers.
- **Job Object Protection**: All Chromium sub-processes are assigned to a Windows Job Object (`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`). If the Node or Tauri process terminates, Windows kernel automatically terminates all child Chromium processes.
- **Heartbeat Monitor**: Stdio ping every 3000ms. If Node engine fails to respond within 9000ms, Tauri terminates the subprocess tree cleanly.
