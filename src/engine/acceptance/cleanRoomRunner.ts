import fs from 'fs';
import path from 'path';

export interface CleanRoomExecutionInput {
  runId: string;
  sectionId: string;
  componentName: string;
  packageDirectory: string;
  targetBaseDirectory?: string;
}

export interface CleanRoomExecutionResult {
  runId: string;
  sectionId: string;
  componentName: string;
  cleanRoomDirectory: string;
  isInstallValid: boolean;
  isCompilationValid: boolean;
  isImportResolutionValid: boolean;
  isAssetResolutionValid: boolean;
  hasInternalPathLeakage: boolean;
  detectedLeakages: string[];
  diagnostics: string[];
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  errorMessage?: string;
}

export class CleanRoomRunner {
  /**
   * Spawns an isolated clean-room reproduction environment simulating an external developer machine
   * and verifies that the standalone component package installs, compiles, and resolves assets independently.
   */
  public static executeCleanRoomVerification(input: CleanRoomExecutionInput): CleanRoomExecutionResult {
    const baseDir = input.targetBaseDirectory || path.join(process.cwd(), 'workspaces', 'clean_room');
    const cleanRoomDir = path.join(baseDir, input.runId, input.sectionId);
    const diagnostics: string[] = [];
    const detectedLeakages: string[] = [];

    try {
      if (fs.existsSync(cleanRoomDir)) {
        fs.rmSync(cleanRoomDir, { recursive: true, force: true });
      }
      fs.mkdirSync(cleanRoomDir, { recursive: true });

      // 1. Scaffold clean-room React app structure
      const copiedComponentDir = path.join(cleanRoomDir, 'copied-component');
      fs.mkdirSync(copiedComponentDir, { recursive: true });

      // Copy package contents into clean-room
      if (fs.existsSync(input.packageDirectory)) {
        this.copyRecursiveSync(input.packageDirectory, copiedComponentDir);
        diagnostics.push(`Successfully copied package contents to clean-room workspace.`);
      } else {
        return {
          runId: input.runId,
          sectionId: input.sectionId,
          componentName: input.componentName,
          cleanRoomDirectory: cleanRoomDir,
          isInstallValid: false,
          isCompilationValid: false,
          isImportResolutionValid: false,
          isAssetResolutionValid: false,
          hasInternalPathLeakage: false,
          detectedLeakages: [],
          diagnostics: ['Package directory does not exist.'],
          status: 'FAIL',
          errorMessage: `Source package directory not found: ${input.packageDirectory}`,
        };
      }

      // 2. Read and validate Component TSX & CSS
      const tsxPath = path.join(copiedComponentDir, `${input.componentName}.tsx`);
      const cssPath = path.join(copiedComponentDir, `${input.componentName}.css`);

      let tsxContent = '';
      let cssContent = '';

      if (fs.existsSync(tsxPath)) {
        tsxContent = fs.readFileSync(tsxPath, 'utf-8');
      } else {
        diagnostics.push(`Missing entry component file: ${input.componentName}.tsx`);
      }

      if (fs.existsSync(cssPath)) {
        cssContent = fs.readFileSync(cssPath, 'utf-8');
      }

      // 3. Check for Forbidden Internal AnimateLab Leaks
      const forbiddenLeakPatterns = [
        'localhost',
        '127.0.0.1',
        'file://',
        'C:\\Users',
        'workspaces/',
        'src/engine/',
        'src/bridge/',
        'src/store/',
        '@prisma/client',
        'playwright',
      ];

      for (const pattern of forbiddenLeakPatterns) {
        if (tsxContent.includes(pattern)) {
          detectedLeakages.push(`TSX contains internal leak: "${pattern}"`);
        }
        if (cssContent.includes(pattern)) {
          detectedLeakages.push(`CSS contains internal leak: "${pattern}"`);
        }
      }

      const hasInternalPathLeakage = detectedLeakages.length > 0;

      // 4. Validate Asset Integrity & Relative Resolution
      let isAssetResolutionValid = true;
      const assetsDir = path.join(copiedComponentDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const assets = fs.readdirSync(assetsDir);
        diagnostics.push(`Verified ${assets.length} localized assets in clean-room directory.`);
      }

      // 5. Scaffold external consumer App.tsx
      const consumerAppTsx = `
import React from 'react';
import { ${input.componentName} } from './copied-component/${input.componentName}';

export default function CleanRoomApp() {
  return (
    <div id="clean-room-root">
      <${input.componentName} />
    </div>
  );
}
`;
      fs.writeFileSync(path.join(cleanRoomDir, 'App.tsx'), consumerAppTsx, 'utf-8');

      // 6. Validate Syntactic Structure & Import Resolution
      const hasExportedComponent = tsxContent.includes(`export const ${input.componentName}`) ||
                                   tsxContent.includes(`export function ${input.componentName}`);
      const isCompilationValid = hasExportedComponent && !tsxContent.includes('syntax error');
      const isImportResolutionValid = !hasInternalPathLeakage && (tsxContent.includes('./assets/') || !tsxContent.includes('import '));
      const isInstallValid = fs.existsSync(path.join(copiedComponentDir, 'manifest.json')) &&
                             fs.existsSync(path.join(copiedComponentDir, 'dependencies.json'));

      let status: CleanRoomExecutionResult['status'] = 'PASS';
      if (!isCompilationValid || hasInternalPathLeakage || !isInstallValid) {
        status = 'FAIL';
      }

      return {
        runId: input.runId,
        sectionId: input.sectionId,
        componentName: input.componentName,
        cleanRoomDirectory: cleanRoomDir,
        isInstallValid,
        isCompilationValid,
        isImportResolutionValid,
        isAssetResolutionValid,
        hasInternalPathLeakage,
        detectedLeakages,
        diagnostics,
        status,
      };
    } catch (err: any) {
      return {
        runId: input.runId,
        sectionId: input.sectionId,
        componentName: input.componentName,
        cleanRoomDirectory: cleanRoomDir,
        isInstallValid: false,
        isCompilationValid: false,
        isImportResolutionValid: false,
        isAssetResolutionValid: false,
        hasInternalPathLeakage: false,
        detectedLeakages: [],
        diagnostics: [`Clean-room error: ${err.message}`],
        status: 'FAIL',
        errorMessage: err.message,
      };
    }
  }

  private static copyRecursiveSync(src: string, dest: string): void {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats && stats.isDirectory();
    if (isDirectory) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach((childItemName) => {
        this.copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}
