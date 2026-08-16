export interface SectionCompletenessReport {
  websiteId: string;
  url: string;
  totalMeaningfulSections: number;
  isolatedSectionsCount: number;
  partialSectionsCount: number;
  unsupportedSectionsCount: number;
  failedSectionsCount: number;
  completenessScore: number; // 0-100%
  rating: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  sectionBreakdown: Array<{
    sectionId: string;
    title: string;
    category: string;
    status: 'ISOLATED' | 'PARTIAL' | 'UNSUPPORTED' | 'FAILED';
    reproduciblePackagePath?: string;
  }>;
}

export class SectionCompletenessCalculator {
  /**
   * Computes the Phase 13 primary KPI: Section Completeness.
   */
  public static calculateCompleteness(input: {
    websiteId: string;
    url: string;
    sections: Array<{
      sectionId: string;
      title: string;
      category: string;
      status: 'ISOLATED' | 'PARTIAL' | 'UNSUPPORTED' | 'FAILED';
      packagePath?: string;
    }>;
  }): SectionCompletenessReport {
    const totalMeaningfulSections = Math.max(1, input.sections.length);
    let isolatedSectionsCount = 0;
    let partialSectionsCount = 0;
    let unsupportedSectionsCount = 0;
    let failedSectionsCount = 0;

    for (const sec of input.sections) {
      if (sec.status === 'ISOLATED') isolatedSectionsCount++;
      else if (sec.status === 'PARTIAL') partialSectionsCount++;
      else if (sec.status === 'UNSUPPORTED') unsupportedSectionsCount++;
      else failedSectionsCount++;
    }

    // Formula: (isolated + 0.5 * partial) / total * 100
    const completenessScore = Math.min(
      100,
      Math.round(((isolatedSectionsCount + 0.5 * partialSectionsCount) / totalMeaningfulSections) * 100)
    );

    let rating: SectionCompletenessReport['rating'] = 'POOR';
    if (completenessScore >= 90) rating = 'EXCELLENT';
    else if (completenessScore >= 80) rating = 'GOOD';
    else if (completenessScore >= 65) rating = 'ACCEPTABLE';

    return {
      websiteId: input.websiteId,
      url: input.url,
      totalMeaningfulSections,
      isolatedSectionsCount,
      partialSectionsCount,
      unsupportedSectionsCount,
      failedSectionsCount,
      completenessScore,
      rating,
      sectionBreakdown: input.sections.map((s) => ({
        sectionId: s.sectionId,
        title: s.title,
        category: s.category,
        status: s.status,
        reproduciblePackagePath: s.packagePath,
      })),
    };
  }
}
