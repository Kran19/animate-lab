# Phase 4 — Node.js Engine Sidecar + AppBridge IPC Implementation Report

**Project**: AnimateLab — Web Experience Component Extractor / Animation Lab  
**Phase**: Phase 4 — Node.js Engine Sidecar + AppBridge IPC  
**Status**: **LOCKED / GREEN**  

---

## 1. Executive Summary & Verification

Phase 4 establishes the process isolation and typed IPC communication layer between the React UI (via `AppBridge`) and the Node.js Engine Sidecar backend.

Pursuant to Phase 4 guidelines:
- **NO** Playwright binaries were installed or used.
- **NO** Chromium instances were spawned.
- **NO** crawling, browser automation, animation detection, or WebGL analysis was performed.
- **NO** generic `executeCommand`, `runShell`, or `executeSQL` IPC endpoints were exposed.
- **NO** stdout log pollution occurred (stdio transport stream remains 100% pure JSON-RPC messages; diagnostic logs route strictly to stderr).
- Desktop mode communicates strictly via typed IPC to the Node sidecar, protecting database and filesystem operations behind process boundaries.

---

## 2. Process & IPC Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Desktop                        │
│                                                         │
│ React UI  ───► AppBridge  ───► IPCClient                │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Stdio JSON-RPC Protocol (version: 1)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Node.js Engine Sidecar                 │
│                                                         │
│ EngineServer                                            │
│   ├── Stdio Transport                                   │
│   ├── RequestRouter & Validator                         │
│   ├── JobSupervisor (State & Persistence)              │
│   ├── FTSManager & Worker Thread (worker_threads)      │
│   └── Database Repositories (Prisma + SQLite)           │
└────────────────────────────┬────────────────────────────┘
                             │
                  ┌──────────┴───────────┐
                  ▼                      ▼
              SQLite DB              Filesystem
          (workspace-data)       (assets/sha256/...)
```

---

## 3. Acceptance Criteria & Status Matrix

| Requirement | Status | Evidence / Verification |
| :--- | :---: | :--- |
| **NODE STARTUP** | **PASS** | `EngineServer` state transitions: `STOPPED` $\rightarrow$ `STARTING` $\rightarrow$ `READY` |
| **READY HANDSHAKE** | **PASS** | Handshake event `engine.ready` emitted on startup; `IPCClient.waitUntilReady()` resolves |
| **IPC PROTOCOL** | **PASS** | Typed JSON-RPC 2.0 requests (`requestId`, `method`, `params`, `protocolVersion: 1`) |
| **REQUEST CORRELATION** | **PASS** | Map-correlated asynchronous requests in flight (`Map<string, PendingRequest>`) |
| **ERROR HANDLING** | **PASS** | Structured error codes (`INVALID_REQUEST`, `PROTOCOL_MISMATCH`, `VALIDATION_FAILED`, etc.) |
| **TIMEOUTS** | **PASS** | `IPCTimeoutError` triggered after configurable timeout (default 10,000ms) |
| **EVENTS** | **PASS** | Engine events (`job.progress`, `engine.warning`) broadcast over IPC channel |
| **JOB FOUNDATION** | **PASS** | Interrupted `running` jobs cleanly recovered as `paused` on sidecar restart |
| **DATABASE ACCESS** | **PASS** | Prisma Client strictly insulated behind Node sidecar IPC boundary |
| **STORAGE ACCESS** | **PASS** | Filesystem operations strictly insulated behind Node sidecar IPC boundary |
| **FTS WORKER FOUNDATION**| **PASS** | `FTSManager` handles Node `Worker` thread (`worker_threads`) lifecycle |
| **WORKER RECOVERY** | **PASS** | Bounded worker restart mechanism (max 3 retries) on crash |
| **SHUTDOWN** | **PASS** | Graceful sequence: stops workers, closes readline, disconnects Prisma cleanly |
| **SECURITY** | **PASS** | Rejects path traversal (`../`) & malformed envelopes; NO arbitrary SQL/shell endpoints |
| **TESTS** | **PASS** | **19 / 19 Vitest tests passed 100% GREEN** (`tests/phase4_sidecar_ipc.test.ts`) |
| **TYPECHECK** | **PASS** | `npx tsc --noEmit` exited cleanly with 0 errors |
| **BUILD** | **PASS** | `npx vite build` succeeded in 11.63s (`dist/assets/index-Dm8vP7iN.js`) |
| **UI REGRESSION** | **PASS** | AppBridge interface unchanged; UI operates without direct DB/FS imports |
| **NO PLAYWRIGHT** | **VERIFIED** | Playwright dependencies strictly absent from `package.json` |
| **NO CHROMIUM** | **VERIFIED** | 0 browser binaries or Chromium processes executed during Phase 4 |

---

## 4. Installed & Tested Components

- `src/engine/ipc/protocol.ts`: Typed protocol specification & namespaces (`system.*`, `website.*`, `job.*`, `storage.*`).
- `src/engine/ipc/requestRouter.ts`: Request Router, validation, security checks, and repository dispatcher.
- `src/engine/sidecar/engineServer.ts`: Engine Sidecar Server managing stdio stream, handshake, and graceful shutdown.
- `src/engine/jobs/jobSupervisor.ts`: Job state supervisor and database crash recovery.
- `src/engine/search/ftsWorker.ts` & `ftsManager.ts`: Node `worker_threads` manager for FTS search offloading.
- `src/bridge/ipcClient.ts`: Frontend IPC Client with request correlation, timeouts, and typed IPC Repositories.

---

## 5. Phase 5 Readiness

Phase 4 is **100% LOCKED / GREEN**. The communication and process engine foundation is fully prepared for Phase 5 (Playwright & Browser Worker Pool Integration).
