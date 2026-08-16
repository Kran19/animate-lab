const isNode = typeof process !== 'undefined' && !!process.versions?.node;

function safeResolve(...segments: string[]): string {
  if (isNode) {
    try {
      const p = require('path');
      return p.resolve(...segments);
    } catch {
      // fallback
    }
  }
  return segments.filter(Boolean).join('/').replace(/\/+/g, '/');
}

function safeJoin(...segments: string[]): string {
  if (isNode) {
    try {
      const p = require('path');
      return p.join(...segments);
    } catch {
      // fallback
    }
  }
  return segments.filter(Boolean).join('/').replace(/\/+/g, '/');
}

function safeDirname(p: string): string {
  if (isNode) {
    try {
      const pathMod = require('path');
      return pathMod.dirname(p);
    } catch {
      // fallback
    }
  }
  const parts = p.split('/');
  parts.pop();
  return parts.join('/') || '/';
}

export interface WorkspacePaths {
  workspaceRoot: string;
  databasePath: string;
  websitesPath: string;
  assetsPath: string;
  componentsPath: string;
  capturesPath: string;
  exportsPath: string;
  logsPath: string;
  cachePath: string;
  tmpPath: string;
}

export class WorkspaceConfig {
  private rootDir: string;

  constructor(customRoot?: string) {
    const defaultRoot = isNode
      ? (typeof process !== 'undefined' && process.env?.ANIMATE_LAB_WORKSPACE) || safeResolve(process.cwd(), 'workspace-data')
      : '/workspace-data';
    this.rootDir = safeResolve(customRoot || defaultRoot);
  }

  public getWorkspaceRoot(): string {
    return this.rootDir;
  }

  public setWorkspaceRoot(newRoot: string): void {
    this.rootDir = safeResolve(newRoot);
    this.ensureDirectoryStructure();
  }

  public getPaths(): WorkspacePaths {
    return {
      workspaceRoot: this.rootDir,
      databasePath: safeJoin(this.rootDir, 'database', 'app.db'),
      websitesPath: safeJoin(this.rootDir, 'websites'),
      assetsPath: safeJoin(this.rootDir, 'assets'),
      componentsPath: safeJoin(this.rootDir, 'components'),
      capturesPath: safeJoin(this.rootDir, 'captures'),
      exportsPath: safeJoin(this.rootDir, 'exports'),
      logsPath: safeJoin(this.rootDir, 'logs'),
      cachePath: safeJoin(this.rootDir, 'cache'),
      tmpPath: safeJoin(this.rootDir, 'tmp'),
    };
  }

  public ensureDirectoryStructure(): WorkspacePaths {
    const paths = this.getPaths();
    if (!isNode) return paths;

    try {
      const fsMod = require('fs');
      const dirsToCreate = [
        this.rootDir,
        safeDirname(paths.databasePath),
        paths.websitesPath,
        paths.assetsPath,
        paths.componentsPath,
        paths.capturesPath,
        paths.exportsPath,
        paths.logsPath,
        paths.cachePath,
        paths.tmpPath,
      ];

      for (const dir of dirsToCreate) {
        if (!fsMod.existsSync(dir)) {
          fsMod.mkdirSync(dir, { recursive: true });
        }
      }
    } catch {}

    return paths;
  }

  public validatePathSecurity(targetPath: string): string {
    const resolved = safeResolve(targetPath);
    const normalizedRoot = safeResolve(this.rootDir);
    if (!resolved.startsWith(normalizedRoot)) {
      throw new Error(`PathSecurityError: Target path "${targetPath}" escapes configured workspace root "${normalizedRoot}"`);
    }
    return resolved;
  }
}

export const defaultWorkspaceConfig = new WorkspaceConfig();
