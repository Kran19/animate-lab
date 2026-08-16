import { createHash } from 'crypto';
import { NormalizedComponent } from './codeNormalizer';
import { SectionFIR } from '../domain/fir/sectionFIR';
import { SynthesisPlan, PlanBuilder } from './synthesisPlan';
import { MotionSynthesizer } from './motionSynthesizer';
import { InteractionSynthesizer } from './interactionSynthesizer';

export interface ComponentPropPropDef {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface GeneratedComponent {
  sourceCandidateId: string;
  websiteId: string;
  pageId: string;
  componentName: string;
  tsxCode: string;
  cssCode: string;
  propsDocJson: string;
  generationInputHash: string;
  outputHash: string;
  generationVersion: string;
  normalizedData: NormalizedComponent;
  diagnostics: string[];
  stage: 'GENERATED';
}

export class ReactGenerator {
  public static readonly GENERATOR_VERSION = '1.0.0';

  /**
   * Generates clean, typed, production React TSX code with evidence-based prop inference
   * and portable relative asset imports.
   */
  public generateReactComponent(normalized: NormalizedComponent): GeneratedComponent {
    const diagnostics = [...normalized.diagnostics];
    const componentName = this.toPascalCase(normalized.title) || 'ExtractedComponent';

    // 1. Calculate Input Hash for Determinism
    const inputPayload = JSON.stringify({
      html: normalized.normalizedHtml,
      css: normalized.scopedCss,
      assets: normalized.portableAssets,
    });
    const generationInputHash = createHash('sha256').update(inputPayload).digest('hex');

    // 2. Evidence-Based Prop Inference (No Invented Props)
    const props: ComponentPropPropDef[] = [];
    const propAssignments: Record<string, string> = {};

    // Only infer props if candidate text content matches explicit dynamic patterns
    if (normalized.normalizedHtml.includes('<h1') || normalized.normalizedHtml.includes('<h2')) {
      props.push({
        name: 'title',
        type: 'string',
        required: false,
        defaultValue: 'Component Heading',
        description: 'Primary visual title heading',
      });
      propAssignments['title'] = 'title';
    }

    // 3. Generate Portable Asset ES Imports
    let assetImportsCode = '';
    let jsxHtml = normalized.normalizedHtml;

    normalized.portableAssets.forEach((pa, idx) => {
      assetImportsCode += `import ${pa.importName} from './${pa.exportPath}';\n`;
      // Replace relative src string with JSX variable binding
      jsxHtml = jsxHtml.replace(new RegExp(`src=["']\\./${pa.exportPath}["']`, 'g'), `src={${pa.importName}}`);
    });

    // 4. Convert HTML String to Clean JSX Elements
    const jsxBody = this.htmlToJsx(jsxHtml, normalized.componentPrefix);

    // 5. Construct Props Interface Definition
    let propsInterfaceCode = 'export interface Props {\n';
    if (props.length === 0) {
      propsInterfaceCode += '  // Static visual component - no dynamic props inferred\n';
      propsInterfaceCode += '  className?: string;\n';
    } else {
      propsInterfaceCode += '  className?: string;\n';
      for (const p of props) {
        propsInterfaceCode += `  ${p.name}?: ${p.type};\n`;
      }
    }
    propsInterfaceCode += '}\n';

    // 6. Assemble Full React TSX Source Code
    const tsxCode = `import React from 'react';
import './${componentName}.css';
${assetImportsCode}
${propsInterfaceCode}
export const ${componentName}: React.FC<Props> = ({
  className = '',
  title,
}) => {
  return (
    <div className={\`${normalized.componentPrefix}-root \${className}\`.trim()}>
      ${jsxBody}
    </div>
  );
};

export default ${componentName};
`;

    // 7. Calculate Output Hash for Determinism
    const outputHash = createHash('sha256').update(tsxCode + normalized.scopedCss).digest('hex');

    return {
      sourceCandidateId: normalized.sourceCandidateId,
      websiteId: normalized.websiteId,
      pageId: normalized.pageId,
      componentName,
      tsxCode,
      cssCode: normalized.scopedCss,
      propsDocJson: JSON.stringify(props, null, 2),
      generationInputHash,
      outputHash,
      generationVersion: ReactGenerator.GENERATOR_VERSION,
      normalizedData: normalized,
      diagnostics,
      stage: 'GENERATED',
    };
  }

  /**
   * Synthesizes a clean React component strictly from an immutable SectionFIR and its SynthesisPlan.
   * Zero browser dependency.
   */
  public generateFromFIR(fir: SectionFIR, customPlan?: SynthesisPlan): GeneratedComponent {
    const plan = customPlan || PlanBuilder.buildPlan(fir);
    const componentName = plan.componentName;
    const diagnostics: string[] = [...fir.diagnostics.warnings, ...plan.knownLimitations];

    // 1. Calculate input hash for determinism
    const inputPayload = JSON.stringify({
      firHash: fir.diagnostics.integrityHash,
      planId: plan.planId,
      tier: plan.capabilityTier,
    });
    const generationInputHash = createHash('sha256').update(inputPayload).digest('hex');

    // 2. Generate Props Interface
    const props: ComponentPropPropDef[] = [];
    if (fir.dom.rawHtmlSnapshot.includes('<h1') || fir.dom.rawHtmlSnapshot.includes('<h2')) {
      props.push({
        name: 'title',
        type: 'string',
        required: false,
        defaultValue: fir.identity.title,
        description: 'Primary visual title heading',
      });
    }

    // 3. Generate Asset Imports
    let assetImportsCode = '';
    plan.assetImports.forEach((ai) => {
      assetImportsCode += `import ${ai.variableName} from '${ai.relativePath}';\n`;
    });

    // 4. Handle Motion Graph & GSAP Synthesis
    const rootSelector = `.${componentName.toLowerCase()}-root`;
    const motionSynthesis = MotionSynthesizer.synthesize(fir.motion.traces, rootSelector);
    diagnostics.push(...motionSynthesis.diagnostics);

    // 5. Handle Interaction State & Hook Synthesis
    const interactionSynthesis = InteractionSynthesizer.synthesize(fir.interactions.interactions);
    diagnostics.push(...interactionSynthesis.diagnostics);

    // 6. Convert DOM snapshot to JSX
    let rawJsx = this.htmlToJsx(fir.dom.sanitizedHtmlSnapshot, componentName.toLowerCase());

    // Inject event attributes into raw JSX if matched
    Object.keys(interactionSynthesis.injectedEventAttributes).forEach((sel) => {
      const attr = interactionSynthesis.injectedEventAttributes[sel];
      const tagMatch = sel.replace(/[.#]/, '').split(/\s+/).pop() || 'button';

      if (rawJsx.includes(`class="` + tagMatch) || rawJsx.includes(`className="` + tagMatch) || rawJsx.includes(`class='` + tagMatch)) {
        rawJsx = rawJsx.replace(new RegExp(`(<(?:button|div|section|a)[^>]*class(?:Name)?=["'][^"']*${tagMatch}[^"']*["'])`, 'i'), `$1 ${attr}`);
      } else if (sel.includes('button') && rawJsx.includes('<button')) {
        rawJsx = rawJsx.replace(/<button(\s|>)/i, `<button ${attr}$1`);
      } else if (rawJsx.includes(`<${tagMatch}`)) {
        rawJsx = rawJsx.replace(new RegExp(`<${tagMatch}(\\s|>)`, 'i'), `<${tagMatch} ${attr}$1`);
      }
    });

    // 7. Build Props Code
    let propsInterfaceCode = 'export interface Props {\n  className?: string;\n';
    for (const p of props) {
      propsInterfaceCode += `  ${p.name}?: ${p.type};\n`;
    }
    propsInterfaceCode += '}\n';

    // 8. Assemble TSX Source Code
    const tsxCode = `import React from 'react';
import './${componentName}.css';
${motionSynthesis.importsCode}${assetImportsCode}
${propsInterfaceCode}
export const ${componentName}: React.FC<Props> = ({
  className = '',
  title,
}) => {
${interactionSynthesis.hookCode}
${motionSynthesis.hookCode}
  return (
    <div className={\`${componentName.toLowerCase()}-root \${className}\`.trim()}>
      ${rawJsx}
    </div>
  );
};

export default ${componentName};
`;

    const scopedCss = fir.styles.scopedCssSnippet || `.${componentName.toLowerCase()}-root { display: block; box-sizing: border-box; }`;
    const outputHash = createHash('sha256').update(tsxCode + scopedCss).digest('hex');

    const syntheticNormalized: NormalizedComponent = {
      sourceCandidateId: fir.identity.sectionId,
      websiteId: fir.identity.websiteId,
      pageId: fir.identity.pageId,
      title: fir.identity.title,
      category: fir.identity.category,
      componentPrefix: componentName.toLowerCase(),
      normalizedHtml: fir.dom.sanitizedHtmlSnapshot,
      scopedCss,
      portableAssets: plan.assetImports.map((ai) => ({
        originalUrl: ai.relativePath,
        exportPath: ai.relativePath.replace(/^\.\//, ''),
        importName: ai.variableName,
      })),
      diagnostics,
      stage: 'NORMALIZED',
    };

    return {
      sourceCandidateId: fir.identity.sectionId,
      websiteId: fir.identity.websiteId,
      pageId: fir.identity.pageId,
      componentName,
      tsxCode,
      cssCode: scopedCss,
      propsDocJson: JSON.stringify(props, null, 2),
      generationInputHash,
      outputHash,
      generationVersion: ReactGenerator.GENERATOR_VERSION,
      normalizedData: syntheticNormalized,
      diagnostics,
      stage: 'GENERATED',
    };
  }

  private htmlToJsx(html: string, prefix: string): string {
    return html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/autocomplete=/g, 'autoComplete=');
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[a-z]/, (m) => m.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');
  }
}
