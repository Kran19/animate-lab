import * as fs from 'fs';
import * as path from 'path';

export interface LibraryComponentEntry {
  componentId: string;
  componentName: string;
  sourceUrl: string;
  websiteDomain: string;
  category: string;
  pattern?: string;
  patternArchetype?: string;
  technologies: string[];
  animationType: string;
  scrollDependency: string;
  isResponsive: boolean;
  reconstructabilityScore: number;
  visualSimilarityScore: number;
  behavioralFidelityScore: number;
  disposition: 'COPY_USE_CERTIFIED' | 'COPY_USE_PARTIAL' | 'COPY_USE_FAILED';
  packagePath: string;
  indexedAt: string;
}

export interface LibraryCatalog {
  totalComponents: number;
  certifiedCount: number;
  partialCount: number;
  failedCount: number;
  lastUpdated: string;
  components: LibraryComponentEntry[];
}

export class LibraryIndexer {
  public static getLibraryDir(baseDir: string = process.cwd()): string {
    const dir = path.join(baseDir, 'workspace-data', 'library');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  public static getCatalogPath(baseDir: string = process.cwd()): string {
    return path.join(this.getLibraryDir(baseDir), 'index.json');
  }

  public static readCatalog(baseDir: string = process.cwd()): LibraryCatalog {
    const catalogFile = this.getCatalogPath(baseDir);
    if (!fs.existsSync(catalogFile)) {
      return {
        totalComponents: 0,
        certifiedCount: 0,
        partialCount: 0,
        failedCount: 0,
        lastUpdated: new Date().toISOString(),
        components: [],
      };
    }
    try {
      return JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
    } catch {
      return {
        totalComponents: 0,
        certifiedCount: 0,
        partialCount: 0,
        failedCount: 0,
        lastUpdated: new Date().toISOString(),
        components: [],
      };
    }
  }

  public static indexComponent(entry: LibraryComponentEntry, baseDir: string = process.cwd()): LibraryCatalog {
    const catalog = this.readCatalog(baseDir);
    const existingIdx = catalog.components.findIndex((c) => c.componentId === entry.componentId);

    if (existingIdx >= 0) {
      catalog.components[existingIdx] = entry;
    } else {
      catalog.components.push(entry);
    }

    catalog.totalComponents = catalog.components.length;
    catalog.certifiedCount = catalog.components.filter((c) => c.disposition === 'COPY_USE_CERTIFIED').length;
    catalog.partialCount = catalog.components.filter((c) => c.disposition === 'COPY_USE_PARTIAL').length;
    catalog.failedCount = catalog.components.filter((c) => c.disposition === 'COPY_USE_FAILED').length;
    catalog.lastUpdated = new Date().toISOString();

    fs.writeFileSync(this.getCatalogPath(baseDir), JSON.stringify(catalog, null, 2), 'utf-8');
    return catalog;
  }

  public static searchCatalog(
    query: { category?: string; tech?: string; disposition?: string; minScore?: number },
    baseDir: string = process.cwd()
  ): LibraryComponentEntry[] {
    const catalog = this.readCatalog(baseDir);
    return catalog.components.filter((c) => {
      if (query.category && c.category.toUpperCase() !== query.category.toUpperCase()) return false;
      if (query.disposition && c.disposition !== query.disposition) return false;
      if (query.tech && !c.technologies.some((t) => t.toLowerCase().includes(query.tech!.toLowerCase()))) return false;
      if (typeof query.minScore === 'number' && c.reconstructabilityScore < query.minScore) return false;
      return true;
    });
  }
}
