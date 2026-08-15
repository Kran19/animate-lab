import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { WorkspaceConfig, defaultWorkspaceConfig } from './workspaceConfig';

export interface ContentFileMetadata {
  hash: string;
  localPath: string;
  sizeBytes: bigint;
  extension: string;
}

export class ContentStore {
  private config: WorkspaceConfig;

  constructor(config: WorkspaceConfig = defaultWorkspaceConfig) {
    this.config = config;
  }

  /**
   * Calculates SHA-256 hash of a file on disk via streaming.
   */
  public async computeFileHash(filePath: string): Promise<string> {
    this.config.validatePathSecurity(filePath);
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   * Calculates SHA-256 hash of an in-memory Buffer.
   */
  public computeBufferHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Computes content-addressable storage path given a SHA-256 hash.
   * Format: assets/sha256/ab/cd/abcd1234...ext
   */
  public getStoragePath(hash: string, extension: string = ''): string {
    const cleanExt = extension ? (extension.startsWith('.') ? extension : `.${extension}`) : '';
    const prefix1 = hash.slice(0, 2);
    const prefix2 = hash.slice(2, 4);
    const relativePath = path.join('assets', 'sha256', prefix1, prefix2, `${hash}${cleanExt}`);
    const fullPath = path.join(this.config.getWorkspaceRoot(), relativePath);
    return this.config.validatePathSecurity(fullPath);
  }

  /**
   * Atomic File Write:
   * Writes buffer to temporary file in /tmp/ -> computes SHA-256 -> atomic rename to content-addressable storage path.
   */
  public async saveBufferAtomic(buffer: Buffer, extension: string = ''): Promise<ContentFileMetadata> {
    const hash = this.computeBufferHash(buffer);
    const finalPath = this.getStoragePath(hash, extension);

    // If file already exists physically with matching size, return immediately (deduplication)
    if (fs.existsSync(finalPath)) {
      const stat = fs.statSync(finalPath);
      return {
        hash,
        localPath: finalPath,
        sizeBytes: BigInt(stat.size),
        extension,
      };
    }

    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });

    // Write to temporary file first
    const tmpDir = this.config.getPaths().tmpPath;
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, `upload-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.tmp`);

    await fs.promises.writeFile(tmpFile, buffer);
    const stat = await fs.promises.stat(tmpFile);

    // Verify hash matches
    const writtenHash = await this.computeFileHash(tmpFile);
    if (writtenHash !== hash) {
      await fs.promises.unlink(tmpFile).catch(() => {});
      throw new Error(`HashMismatchError: Computed hash ${hash} did not match written file hash ${writtenHash}`);
    }

    // Atomic move to final location
    await fs.promises.rename(tmpFile, finalPath);

    return {
      hash,
      localPath: finalPath,
      sizeBytes: BigInt(stat.size),
      extension,
    };
  }

  /**
   * Reads stored binary file content.
   */
  public async readFile(filePath: string): Promise<Buffer> {
    const validated = this.config.validatePathSecurity(filePath);
    return fs.promises.readFile(validated);
  }

  /**
   * Deletes a stored file safely if it exists.
   */
  public async deleteFile(filePath: string): Promise<boolean> {
    const validated = this.config.validatePathSecurity(filePath);
    if (fs.existsSync(validated)) {
      await fs.promises.unlink(validated);
      return true;
    }
    return false;
  }
}

export const defaultContentStore = new ContentStore();
