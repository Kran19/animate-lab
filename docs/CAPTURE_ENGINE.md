# Capture Engine Specification — AnimateLab (Final Phase 2 Amendments)

## 1. CaptureSession Scope & Ownership

A **`CaptureSession`** represents a continuous, stateful browser execution environment across one or more pages.

### Explicit Ownership Boundaries
`CaptureSession` explicitly owns and manages:
- **`BrowserContext`**: Playwright browser context handle.
- **`Cookies`**: Captured HTTP cookies (`context.cookies()`).
- **`LocalStorage`**: Web storage state JSON snapshot.
- **`SessionStorage`**: Session storage state JSON snapshot.
- **`User-Agent`**: Custom or simulated browser user-agent string.
- **`Headers`**: Base HTTP headers (e.g. `Accept-Language`, custom authorization).
- **`Capture Configuration`**: Active `CaptureConfig` preset.
- **`Session Metadata`**: Start/end timestamps, session version ID.

> [!NOTE]
> **Browser Cache Ownership Notice**: Browser HTTP disk/memory cache remains an internal implementation detail of the underlying Chromium `BrowserContext`. AnimateLab does NOT promise persistent binary cache ownership across app restarts outside of content-addressable files saved via our SHA-256 Resource Store.

---

## 2. Exploration Engine & Configurable Exploration Budgets

The Exploration Engine scrolls and interacts with a page to trigger lazy-loaded media and scroll animations (GSAP ScrollTrigger, Lenis).

### Configurable Independent Exploration Limits

Exploration limits are governed by independent parameters configured in the active Capture Profile:

| Profile Preset | `maxScrollSteps` | `maxScrollDistance` | `maxExplorationDuration` | Early Stopping |
| :--- | :--- | :--- | :--- | :--- |
| **Quick Preview** | 3 steps | 2,500 px | 10 seconds | Enabled (1 step no-op) |
| **Standard** | 10 steps | 10,000 px | 30 seconds | Enabled (3 steps no-op) |
| **3D / Heavy** | 30 steps | 30,000 px | 90 seconds | Enabled (5 steps no-op) |
| **Custom** | Configurable | Configurable | Configurable | Configurable |

> [!IMPORTANT]
> Long creative portfolio pages featuring GSAP ScrollTrigger animations past 5,000px or 10,000px will be fully explored whenever the selected profile (`Standard`, `3D / Heavy`, or `Custom`) permits it.

### Early Stopping Condition
Regardless of max scroll distance, if `newResourcesDetected === 0` AND `domMutationsCount === 0` for **3 consecutive scroll steps**, exploration stops early to conserve system resources.

---

## 3. Platform-Independent StorageMonitor

Disk space monitoring uses an abstract **`StorageMonitor`** interface to insulate business logic from platform-specific filesystem APIs:

```typescript
export interface StorageMonitor {
  getAvailableBytes(targetPath: string): Promise<bigint>;
  getTotalBytes(targetPath: string): Promise<bigint>;
  getUsedBytes(targetPath: string): Promise<bigint>;
}
```

### Safety Threshold Rule
Before queueing a page capture or downloading streaming assets, `getAvailableBytes(storagePath)` is invoked. If available disk space is less than **1.0 GB**, the job supervisor pauses active jobs (`status: paused`) and logs a diagnostic warning: `ERR_DISK_SPACE_LOW`.

---

## 4. SPA Navigation Observer Abstraction

Monitors client-side Single Page Application (SPA) page route transitions via **`NavigationObserver`**:
- Hooks `history.pushState` and `history.replaceState`.
- Listens to `window.onpopstate` and `window.onhashchange`.
- Detects framework-specific router events (Next.js `routeChangeComplete`).
- Observes DOM container subtree replacements (`MutationObserver`).
