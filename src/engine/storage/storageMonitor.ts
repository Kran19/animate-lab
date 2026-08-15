export interface StorageMonitor {
  getAvailableBytes(targetPath: string): Promise<bigint>;
  getTotalBytes(targetPath: string): Promise<bigint>;
  getUsedBytes(targetPath: string): Promise<bigint>;
}

export class DefaultStorageMonitor implements StorageMonitor {
  public async getAvailableBytes(targetPath: string): Promise<bigint> {
    if (typeof process === 'undefined' || !process.versions?.node) {
      return BigInt(100 * 1024 * 1024 * 1024); // 100 GB fallback in browser
    }

    try {
      const fs = await import('fs');
      const path = await import('path');
      const resolvedPath = path.resolve(targetPath);

      if (typeof fs.promises.statfs === 'function') {
        const stats = await fs.promises.statfs(resolvedPath);
        return BigInt(stats.bavail) * BigInt(stats.bsize);
      }
    } catch (e) {}

    if (typeof process !== 'undefined' && process.platform === 'win32') {
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        const path = await import('path');
        const resolvedPath = path.resolve(targetPath);
        const driveLetter = resolvedPath.split(':')[0] || 'C';
        const { stdout } = await execAsync(`powershell -command "(Get-Volume -DriveLetter ${driveLetter}).SizeRemaining"`);
        const bytes = parseInt(stdout.trim(), 10);
        if (!isNaN(bytes)) return BigInt(bytes);
      } catch (e) {}
    }

    return BigInt(100 * 1024 * 1024 * 1024);
  }

  public async getTotalBytes(targetPath: string): Promise<bigint> {
    if (typeof process === 'undefined' || !process.versions?.node) {
      return BigInt(500 * 1024 * 1024 * 1024);
    }

    try {
      const fs = await import('fs');
      const path = await import('path');
      const resolvedPath = path.resolve(targetPath);

      if (typeof fs.promises.statfs === 'function') {
        const stats = await fs.promises.statfs(resolvedPath);
        return BigInt(stats.blocks) * BigInt(stats.bsize);
      }
    } catch (e) {}

    if (typeof process !== 'undefined' && process.platform === 'win32') {
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        const path = await import('path');
        const resolvedPath = path.resolve(targetPath);
        const driveLetter = resolvedPath.split(':')[0] || 'C';
        const { stdout } = await execAsync(`powershell -command "(Get-Volume -DriveLetter ${driveLetter}).Size"`);
        const bytes = parseInt(stdout.trim(), 10);
        if (!isNaN(bytes)) return BigInt(bytes);
      } catch (e) {}
    }

    return BigInt(500 * 1024 * 1024 * 1024);
  }

  public async getUsedBytes(targetPath: string): Promise<bigint> {
    const total = await this.getTotalBytes(targetPath);
    const avail = await this.getAvailableBytes(targetPath);
    return total > avail ? total - avail : BigInt(0);
  }
}

export const defaultStorageMonitor = new DefaultStorageMonitor();
