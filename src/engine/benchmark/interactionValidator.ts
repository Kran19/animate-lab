export interface InteractionEvidenceItem {
  event: 'click' | 'hover' | 'pointermove' | 'pointerenter' | 'pointerleave' | 'drag' | 'scroll' | 'tab' | 'accordion' | 'modal' | 'carousel';
  targetSelector: string;
  observedStateChange: string;
  hasDomEvidence: boolean;
  hasSyntheticCallback: boolean;
  dependency?: string;
}

export interface InteractionAuditResult {
  totalInteractions: number;
  validInteractions: number;
  fabricatedCount: number;
  interactions: Array<{
    event: string;
    targetSelector: string;
    status: 'VERIFIED' | 'FABRICATED' | 'UNKNOWN';
    reproductionStatus: 'REPRODUCED' | 'PARTIAL' | 'UNSUPPORTED';
  }>;
}

export class InteractionValidator {
  /**
   * Audits interaction events against observable DOM evidence to guarantee zero fabricated callbacks.
   */
  public static auditInteractions(items: InteractionEvidenceItem[]): InteractionAuditResult {
    let validInteractions = 0;
    let fabricatedCount = 0;

    const interactions = items.map((item) => {
      let status: 'VERIFIED' | 'FABRICATED' | 'UNKNOWN' = 'UNKNOWN';
      let reproductionStatus: 'REPRODUCED' | 'PARTIAL' | 'UNSUPPORTED' = 'REPRODUCED';

      if (item.hasSyntheticCallback && !item.hasDomEvidence) {
        status = 'FABRICATED';
        reproductionStatus = 'UNSUPPORTED';
        fabricatedCount++;
      } else if (item.hasDomEvidence) {
        status = 'VERIFIED';
        validInteractions++;
      }

      if (item.event === 'drag' && item.dependency?.includes('Matter')) {
        reproductionStatus = 'PARTIAL';
      }

      return {
        event: item.event,
        targetSelector: item.targetSelector,
        status,
        reproductionStatus,
      };
    });

    return {
      totalInteractions: items.length,
      validInteractions,
      fabricatedCount,
      interactions,
    };
  }
}
