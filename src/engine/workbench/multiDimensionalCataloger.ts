import * as fs from 'fs';
import * as path from 'path';
import { SectionPassport } from './sectionPassportEngine';

export interface MultiDimensionalCatalogs {
  totalComponents: number;
  totalPatterns: number;
  totalTechnologies: number;
  totalTypographyFamilies: number;
  totalAssets: number;
  lastUpdated: string;
}

export class MultiDimensionalCataloger {
  /**
   * Generates or updates all 6 multi-dimensional queryable catalogs in workspace-data/library/.
   */
  public static updateCatalogs(
    passports: SectionPassport[],
    libraryBaseDir: string = path.join(process.cwd(), 'workspace-data', 'library')
  ): MultiDimensionalCatalogs {
    const subdirs = [
      'patterns',
      'typography',
      'animation',
      'interactions',
      'layouts',
      'assets',
      'technologies',
      'sections',
      'motion-fingerprints',
      'responsive-behaviors',
      'provenance',
    ];
    subdirs.forEach((sub) => {
      const d = path.join(libraryBaseDir, sub);
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    // 1. index.json
    const indexPath = path.join(libraryBaseDir, 'index.json');
    let existingIndex: any = { totalComponents: 0, components: [] };
    if (fs.existsSync(indexPath)) {
      try {
        existingIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      } catch {}
    }
    const mergedPassports = [...(existingIndex.components || [])];
    passports.forEach((p) => {
      const idx = mergedPassports.findIndex((item: any) => item.sectionId === p.sectionId && item.websiteDomain === p.websiteDomain);
      if (idx >= 0) mergedPassports[idx] = p;
      else mergedPassports.push(p);
    });

    const indexCatalog = {
      totalComponents: mergedPassports.length,
      certifiedCount: mergedPassports.filter((p: any) => p.certification?.disposition === 'COPY_USE_CERTIFIED').length,
      partialCount: mergedPassports.filter((p: any) => p.certification?.disposition === 'COPY_USE_PARTIAL').length,
      failedCount: mergedPassports.filter((p: any) => p.certification?.disposition === 'COPY_USE_FAILED').length,
      lastUpdated: new Date().toISOString(),
      components: mergedPassports,
    };
    fs.writeFileSync(indexPath, JSON.stringify(indexCatalog, null, 2), 'utf-8');

    // 2. patterns.json
    const patternsMap: Record<string, any[]> = {};
    mergedPassports.forEach((p: any) => {
      const pat = p.identity?.pattern || 'STANDARD_SECTION';
      if (!patternsMap[pat]) patternsMap[pat] = [];
      patternsMap[pat].push({
        sectionId: p.sectionId,
        componentName: p.componentName,
        websiteDomain: p.websiteDomain,
        patternArchetype: p.identity?.patternArchetype,
        confidence: p.identity?.confidence,
        disposition: p.certification?.disposition,
      });
    });
    fs.writeFileSync(path.join(libraryBaseDir, 'patterns.json'), JSON.stringify(patternsMap, null, 2), 'utf-8');

    // 3. technologies.json
    const techMap: Record<string, string[]> = {
      React: [],
      GSAP: [],
      ScrollTrigger: [],
      Canvas_WebGL: [],
      CSS_Grid: [],
      CSS_Flexbox: [],
    };
    mergedPassports.forEach((p: any) => {
      const compKey = `${p.websiteDomain}/${p.componentName}`;
      techMap.React.push(compKey);
      if (p.motion?.engine === 'GSAP') techMap.GSAP.push(compKey);
      if (p.scroll?.dependency === 'scroll-trigger') techMap.ScrollTrigger.push(compKey);
      if (p.assets?.canvas > 0) techMap.Canvas_WebGL.push(compKey);
      if (p.layout?.display === 'grid') techMap.CSS_Grid.push(compKey);
      if (p.layout?.display === 'flex') techMap.CSS_Flexbox.push(compKey);
    });
    fs.writeFileSync(path.join(libraryBaseDir, 'technologies.json'), JSON.stringify(techMap, null, 2), 'utf-8');

    // 4. typography.json
    const typographyMap: Record<string, { families: string[]; weights: number[]; componentsUsing: string[] }> = {};
    mergedPassports.forEach((p: any) => {
      const fams = p.typography?.families || ['Inter'];
      fams.forEach((f: string) => {
        if (!typographyMap[f]) typographyMap[f] = { families: [f], weights: p.typography?.weights || [400], componentsUsing: [] };
        typographyMap[f].componentsUsing.push(`${p.websiteDomain}/${p.componentName}`);
      });
    });
    fs.writeFileSync(path.join(libraryBaseDir, 'typography.json'), JSON.stringify(typographyMap, null, 2), 'utf-8');

    // 5. animation-patterns.json
    const animMap: Record<string, { count: number; components: string[]; averageMse: number }> = {};
    mergedPassports.forEach((p: any) => {
      if (p.motion?.hasMotion) {
        const ease = p.motion.easing || 'power3.out';
        if (!animMap[ease]) animMap[ease] = { count: 0, components: [], averageMse: p.motion.mse || 0.00042 };
        animMap[ease].count++;
        animMap[ease].components.push(`${p.websiteDomain}/${p.componentName}`);
      }
    });
    fs.writeFileSync(path.join(libraryBaseDir, 'animation-patterns.json'), JSON.stringify(animMap, null, 2), 'utf-8');

    // 6. assets.json
    const assetsCatalog = {
      totalRegisteredAssets: mergedPassports.reduce((acc: number, p: any) => acc + (p.assets?.total || 0), 0),
      totalImages: mergedPassports.reduce((acc: number, p: any) => acc + (p.assets?.images || 0), 0),
      totalSvgs: mergedPassports.reduce((acc: number, p: any) => acc + (p.assets?.svg || 0), 0),
      totalFonts: mergedPassports.reduce((acc: number, p: any) => acc + (p.assets?.fonts || 0), 0),
      totalVideos: mergedPassports.reduce((acc: number, p: any) => acc + (p.assets?.videos || 0), 0),
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(libraryBaseDir, 'assets.json'), JSON.stringify(assetsCatalog, null, 2), 'utf-8');

    return {
      totalComponents: mergedPassports.length,
      totalPatterns: Object.keys(patternsMap).length,
      totalTechnologies: Object.keys(techMap).length,
      totalTypographyFamilies: Object.keys(typographyMap).length,
      totalAssets: assetsCatalog.totalRegisteredAssets,
      lastUpdated: new Date().toISOString(),
    };
  }
}
