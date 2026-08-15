import path from 'path';
import fs from 'fs';

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
    const isNode = typeof process !== 'undefined' && process.versions?.node;
    const defaultRoot = isNode
      ? process.env.ANIMATE_LAB_WORKSPACE || path.resolve(process.cwd(), 'workspace-data')
      : '/workspace-data';
    this.rootDir = path.resolve(customRoot || defaultRoot);
  }

  public getWorkspaceRoot(): string {
    return this.rootDir;
  }

  public setWorkspaceRoot(newRoot: string): void {
    this.rootDir = path.resolve(newRoot);
    this.ensureDirectoryStructure();
  }

  public getPaths(): WorkspacePaths {
    return {
      workspaceRoot: this.rootDir,
      databasePath: path.join(this.rootDir, 'database', 'app.db'),
      websitesPath: path.join(this.rootDir, 'websites'),
      assetsPath: path.join(this.rootDir, 'assets'),
      componentsPath: path.join(this.rootDir, 'components'),
      capturesPath: path.join(this.rootDir, 'captures'),
      exportsPath: path.join(this.rootDir, 'exports'),
      logsPath: path.join(this.rootDir, 'logs'),
      cachePath: path.join(this.rootDir, 'cache'),
      tmpPath: path.join(this.rootDir, 'tmp'),
    };
  }

  public ensureDirectoryStructure(): WorkspacePaths {
    const paths = this.getPaths();
    const isNode = typeof process !== 'undefined' && process.versions?.node;
    if (!isNode) return paths;

    const dirsToCreate = [
      this.rootDir,
      path.dirname(paths.databasePath),
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
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    return paths;
  }

  public validatePathSecurity(targetPath: string): string {
    const resolved = path.resolve(targetPath);
    const normalizedRoot = path.resolve(this.rootDir);
    if (!resolved.startsWith(normalizedRoot)) {
      throw new Error(`PathSecurityError: Target path "${targetPath}" escapes configured workspace root "${normalizedRoot}"`);
    }
    return resolved;
  }
}

export const defaultWorkspaceConfig = new WorkspaceConfig();
