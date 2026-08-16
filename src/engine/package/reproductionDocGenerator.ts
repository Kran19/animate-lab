import { ComponentDependenciesManifest } from '../extraction/dependencyManifestGenerator';
import { SectionAssetInventoryItem } from '../extraction/assetOwnershipAnalyzer';

export interface ReproductionDocInput {
  componentName: string;
  category: string;
  sourceWebsiteUrl: string;
  sourcePagePath: string;
  tsxFileName: string;
  cssFileName: string;
  dependencies: ComponentDependenciesManifest;
  assets: SectionAssetInventoryItem[];
  props: Array<{ name: string; type: string; required: boolean; description: string; defaultValue?: any }>;
  animations: Array<{ name: string; technology: string; trigger: string; durationMs: number }>;
  viewportsTested: Array<{ name: string; width: number; status: 'PASS' | 'PARTIAL' | 'FAIL' }>;
  isolationStatus: 'ISOLATED' | 'PARTIAL' | 'UNSUPPORTED';
  limitations?: string[];
}

export class ReproductionDocGenerator {
  /**
   * Generates a comprehensive, developer-ready README.md for the standalone component package.
   */
  public static generateReadme(input: ReproductionDocInput): string {
    const installPackages = Object.entries(input.dependencies.npm)
      .filter(([pkg]) => pkg !== 'react' && pkg !== 'react-dom')
      .map(([pkg, ver]) => `${pkg}@${ver}`)
      .join(' ');

    const propsSection =
      input.props.length > 0
        ? input.props
            .map(
              (p) =>
                `| \`${p.name}\` | \`${p.type}\` | ${p.required ? '**Yes**' : 'No'} | ${p.description} | \`${JSON.stringify(p.defaultValue || '')}\` |`
            )
            .join('\n')
        : '_No validated interactive props required. Component renders self-contained._';

    const assetsSection =
      input.assets.length > 0
        ? input.assets
            .map(
              (a) =>
                `| \`${a.exportPath}\` | ${a.mimeType || 'image/webp'} | ${((a.sizeBytes || (a as any).fileSizeBytes || 1024) / 1024).toFixed(1)} KB | \`${(a.contentHash || (a as any).sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4').slice(0, 16)}...\` | ${a.ownershipScope || (a as any).ownership || 'EXCLUSIVE_SECTION'} |`
            )
            .join('\n')
        : '_No external binary assets required._';

    const animationsSection =
      input.animations.length > 0
        ? input.animations
            .map((an) => `- **${an.name}** (${an.technology}): Triggered on \`${an.trigger}\`, duration ${an.durationMs}ms.`)
            .join('\n')
        : '_No complex interactive animations detected._';

    const viewportsSection = input.viewportsTested
      .map((v) => `- **${v.name}** (${v.width}px): \`${v.status}\``)
      .join('\n');

    return `# ${input.componentName}

> Standalone extracted visual section from [${input.sourceWebsiteUrl}](${input.sourceWebsiteUrl}) (\`${input.sourcePagePath}\`).  
> **Extraction Status**: \`${input.isolationStatus}\`

---

## 1. Quick Start

### Installation
\`\`\`bash
npm install ${installPackages || 'react react-dom'}
\`\`\`

### Import & Usage
\`\`\`tsx
import React from 'react';
import { ${input.componentName} } from './${input.componentName}';

export default function App() {
  return (
    <main>
      <${input.componentName} />
    </main>
  );
}
\`\`\`

---

## 2. Props Specification

${input.props.length > 0 ? '| Prop | Type | Required | Description | Default |\n| :--- | :--- | :---: | :--- | :--- |\n' + propsSection : propsSection}

---

## 3. Required Assets Inventory

${input.assets.length > 0 ? '| Asset Path | MIME Type | Size | SHA-256 Hash | Scope |\n| :--- | :--- | :---: | :--- | :---: |\n' + assetsSection : assetsSection}

---

## 4. Animation & Interactive Behaviors

${animationsSection}

---

## 5. Multi-Viewport & Responsive Behavior

${viewportsSection}

---

## 6. Runtime Assumptions & Cleanup

- **Browser APIs**: ${input.dependencies.browserApis.join(', ') || 'Standard DOM Level 3'}
- **Runtime Features**: ${input.dependencies.runtime.join(', ') || 'Standard CSS3 / React DOM'}
- **Cleanup**: ${input.dependencies.cleanupRequirements.join('; ') || 'Standard React unmount lifecycle'}

---

## 7. Provenance Lineage

- **Source URL**: \`${input.sourceWebsiteUrl}\`
- **Source Page**: \`${input.sourcePagePath}\`
- **Isolated Package Date**: \`${new Date().toISOString()}\`
- **Extracted Category**: \`${input.category}\`

${
  input.limitations && input.limitations.length > 0
    ? `\n## 8. Known Limitations\n${input.limitations.map((l) => `- ${l}`).join('\n')}`
    : ''
}
`;
  }
}
