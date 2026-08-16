import fs from 'fs';
import path from 'path';

export interface PackageVerificationResult {
  packagePath: string;
  componentName: string;
  isContractComplete: boolean;
  filesPresent: string[];
  filesMissing: string[];
  manifestValid: boolean;
  dependenciesValid: boolean;
  propsValid: boolean;
  animationValid: boolean;
  interactionValid: boolean;
  provenanceValid: boolean;
  validationReportValid: boolean;
  readmeValid: boolean;
  diagnostics: string[];
}

export class PackageVerifier {
  public static readonly REQUIRED_CONTRACT_FILES = [
    'manifest.json',
    'dependencies.json',
    'props.json',
    'animation.json',
    'interaction.json',
    'provenance.json',
    'validation.json',
    'README.md',
  ];

  /**
   * Verifies that an exported component package conforms strictly to the standalone 10-file contract.
   */
  public static verifyPackageContract(packageDir: string, componentName: string): PackageVerificationResult {
    const diagnostics: string[] = [];
    const filesPresent: string[] = [];
    const filesMissing: string[] = [];

    // 1. Check entry TSX and CSS
    const expectedTsx = `${componentName}.tsx`;
    const expectedCss = `${componentName}.css`;

    if (fs.existsSync(path.join(packageDir, expectedTsx))) {
      filesPresent.push(expectedTsx);
    } else {
      filesMissing.push(expectedTsx);
      diagnostics.push(`Missing entry component file: ${expectedTsx}`);
    }

    if (fs.existsSync(path.join(packageDir, expectedCss))) {
      filesPresent.push(expectedCss);
    } else {
      filesMissing.push(expectedCss);
      diagnostics.push(`Missing scoped stylesheet: ${expectedCss}`);
    }

    // 2. Check all metadata and documentation files
    for (const reqFile of this.REQUIRED_CONTRACT_FILES) {
      if (fs.existsSync(path.join(packageDir, reqFile))) {
        filesPresent.push(reqFile);
      } else {
        filesMissing.push(reqFile);
        diagnostics.push(`Missing required package contract file: ${reqFile}`);
      }
    }

    // 3. Inspect JSON file validities
    const manifestValid = this.isValidJson(path.join(packageDir, 'manifest.json'));
    const dependenciesValid = this.isValidJson(path.join(packageDir, 'dependencies.json'));
    const propsValid = this.isValidJson(path.join(packageDir, 'props.json'));
    const animationValid = this.isValidJson(path.join(packageDir, 'animation.json'));
    const interactionValid = this.isValidJson(path.join(packageDir, 'interaction.json'));
    const provenanceValid = this.isValidJson(path.join(packageDir, 'provenance.json'));
    const validationReportValid = this.isValidJson(path.join(packageDir, 'validation.json'));

    // 4. Inspect README.md validity
    let readmeValid = false;
    const readmePath = path.join(packageDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');
      readmeValid = readmeContent.includes(`# ${componentName}`) &&
                    readmeContent.includes('Quick Start') &&
                    readmeContent.includes('Multi-Viewport');
    }

    const isContractComplete = filesMissing.length === 0 &&
                               manifestValid &&
                               dependenciesValid &&
                               propsValid &&
                               provenanceValid &&
                               validationReportValid &&
                               readmeValid;

    return {
      packagePath: packageDir,
      componentName,
      isContractComplete,
      filesPresent,
      filesMissing,
      manifestValid,
      dependenciesValid,
      propsValid,
      animationValid,
      interactionValid,
      provenanceValid,
      validationReportValid,
      readmeValid,
      diagnostics,
    };
  }

  private static isValidJson(filePath: string): boolean {
    if (!fs.existsSync(filePath)) return false;
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return true;
    } catch {
      return false;
    }
  }
}
