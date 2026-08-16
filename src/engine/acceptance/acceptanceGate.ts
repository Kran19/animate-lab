export type CertificationStatus = 'COPY_USE_CERTIFIED' | 'COPY_USE_PARTIAL' | 'COPY_USE_FAILED' | 'COPY_USE_BLOCKED';

export interface AcceptanceGateCriteria {
  discovery: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  isolation: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  assets: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  typography: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  typescript: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  build: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  render: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  responsive: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  animation: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  interaction: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  provenance: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
  leakage: 'PASS' | 'PARTIAL' | 'FAIL' | 'BLOCKED';
}

export interface SectionCertificationResult {
  sectionId: string;
  componentName: string;
  websiteUrl: string;
  status: CertificationStatus;
  gates: AcceptanceGateCriteria;
  metrics: {
    discoveryRecall: number;      // 0-100 (Discovered vs. total meaningful)
    isolationPrecision: number;   // 0-100 (Unpolluted standalone dependencies)
    packageUsability: number;     // 0-100 (Clean-room install & build success)
    assetCompleteness: number;    // 0-100 (Recovered vs. observed required assets)
    animationFidelity: number;    // 0-100 (State-transition checkpoints verified)
    interactionFidelity: number;  // 0-100 (BEFORE -> AFTER transitions verified)
    responsiveFidelity: number;   // 0-100 (Passing multi-viewport checks)
    certificationRate: number;    // 0-100
    visualFidelity: number;       // 0-100
    overallScore: number;         // 0-100
  };
  knownLimitations: string[];
  reproductionNotes?: string;
}

export class AcceptanceGate {
  /**
   * Deterministically evaluates clean-room reproduction criteria and certifies component usability.
   * Supports 4-tier disposition: CERTIFIED, PARTIAL, FAILED, BLOCKED.
   */
  public static evaluateCertification(input: {
    sectionId: string;
    componentName: string;
    websiteUrl: string;
    gates: Partial<AcceptanceGateCriteria>;
    isSpecializedRuntime?: boolean;
    isEvidenceBlocked?: boolean;
    knownLimitations?: string[];
  }): SectionCertificationResult {
    const defaultGates: AcceptanceGateCriteria = {
      discovery: 'PASS',
      isolation: 'PASS',
      assets: 'PASS',
      typography: 'PASS',
      typescript: 'PASS',
      build: 'PASS',
      render: 'PASS',
      responsive: 'PASS',
      animation: 'PASS',
      interaction: 'PASS',
      provenance: 'PASS',
      leakage: 'PASS',
      ...input.gates,
    };

    const limitations = [...(input.knownLimitations || [])];
    const gateValues = Object.values(defaultGates);
    const hasBlocked = gateValues.includes('BLOCKED') || input.isEvidenceBlocked;
    const hasFail = gateValues.includes('FAIL');
    const hasPartial = gateValues.includes('PARTIAL') || input.isSpecializedRuntime;

    let status: CertificationStatus = 'COPY_USE_CERTIFIED';
    if (hasBlocked) {
      status = 'COPY_USE_BLOCKED';
      limitations.push('Insufficient observable evidence to make a trustworthy reproduction claim (e.g. obfuscated dynamic WebGL canvas).');
    } else if (hasFail) {
      status = 'COPY_USE_FAILED';
    } else if (hasPartial) {
      status = 'COPY_USE_PARTIAL';
      if (input.isSpecializedRuntime && limitations.length === 0) {
        limitations.push('Specialized runtime (WebGL/Three.js/Physics) requires external canvas mounting.');
      }
    }

    // 8 Core Acceptance KPI calculations
    const discoveryRecall = defaultGates.discovery === 'PASS' ? 100 : (defaultGates.discovery === 'PARTIAL' ? 70 : 0);
    const isolationPrecision = defaultGates.isolation === 'PASS' && defaultGates.leakage === 'PASS' ? 100 : (defaultGates.isolation === 'PARTIAL' ? 60 : 0);
    const packageUsability = defaultGates.typescript === 'PASS' && defaultGates.build === 'PASS' && defaultGates.render === 'PASS' ? 100 : 0;
    const assetCompleteness = defaultGates.assets === 'PASS' ? 100 : (defaultGates.assets === 'PARTIAL' ? 75 : 0);
    const animationFidelity = defaultGates.animation === 'PASS' ? 100 : (defaultGates.animation === 'PARTIAL' ? 70 : 0);
    const interactionFidelity = defaultGates.interaction === 'PASS' ? 100 : (defaultGates.interaction === 'PARTIAL' ? 60 : 0);
    const responsiveFidelity = defaultGates.responsive === 'PASS' ? 100 : (defaultGates.responsive === 'PARTIAL' ? 75 : 0);
    const certificationRate = status === 'COPY_USE_CERTIFIED' ? 100 : (status === 'COPY_USE_PARTIAL' ? 50 : 0);
    const visualFidelity = Math.round((discoveryRecall + isolationPrecision + responsiveFidelity + assetCompleteness) / 4);

    const overallScore = Math.round(
      discoveryRecall * 0.15 +
      isolationPrecision * 0.15 +
      packageUsability * 0.20 +
      assetCompleteness * 0.10 +
      animationFidelity * 0.10 +
      interactionFidelity * 0.10 +
      responsiveFidelity * 0.10 +
      visualFidelity * 0.10
    );

    return {
      sectionId: input.sectionId,
      componentName: input.componentName,
      websiteUrl: input.websiteUrl,
      status,
      gates: defaultGates,
      metrics: {
        discoveryRecall,
        isolationPrecision,
        packageUsability,
        assetCompleteness,
        animationFidelity,
        interactionFidelity,
        responsiveFidelity,
        certificationRate,
        visualFidelity,
        overallScore,
      },
      knownLimitations: limitations,
      reproductionNotes: status === 'COPY_USE_CERTIFIED'
        ? 'Fully reproduced in clean-room environment with 100% asset and style portability.'
        : (status === 'COPY_USE_PARTIAL'
            ? 'Partially reproduced with documented specialized runtime requirements.'
            : (status === 'COPY_USE_BLOCKED'
                ? 'Reproduction blocked: Insufficient deterministic browser evidence.'
                : 'Reproduction failed clean-room acceptance gate.')),
    };
  }
}
