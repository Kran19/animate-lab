export type AssetAnomalyType =
  | 'MISSING_ASSET'
  | 'WRONG_ASSET'
  | 'UNREFERENCED_ASSET'
  | 'EXTERNAL_ASSET'
  | 'DUPLICATE_ASSET'
  | 'CORRUPTED_ASSET';

export interface AssetValidationInput {
  assetId: string;
  originalUrl: string;
  exportPath: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
  isReferencedInCode: boolean;
  fileExistsOnDisk?: boolean;
}

export interface AssetValidationResult {
  assetId: string;
  isValid: boolean;
  anomalies: AssetAnomalyType[];
  details: string[];
}

export class AssetCompletenessValidator {
  /**
   * Validates individual asset items and checks for missing, duplicate, or unreferenced assets.
   */
  public static validateAsset(input: AssetValidationInput): AssetValidationResult {
    const anomalies: AssetAnomalyType[] = [];
    const details: string[] = [];

    // 1. Check if asset path is portable
    if (!input.exportPath.startsWith('assets/') && !input.exportPath.startsWith('./assets/')) {
      anomalies.push('EXTERNAL_ASSET');
      details.push(`Export path "${input.exportPath}" is not local to component assets/ folder.`);
    }

    // 2. Check if asset is referenced in TSX or CSS
    if (!input.isReferencedInCode) {
      anomalies.push('UNREFERENCED_ASSET');
      details.push(`Asset is bundled but not referenced in component markup or styles.`);
    }

    // 3. Check for size validity
    if (input.sizeBytes <= 0) {
      anomalies.push('CORRUPTED_ASSET');
      details.push('Asset file has 0 byte payload size.');
    }

    // 4. Check for disk presence if flagged
    if (input.fileExistsOnDisk === false) {
      anomalies.push('MISSING_ASSET');
      details.push('Physical asset file missing from disk.');
    }

    return {
      assetId: input.assetId,
      isValid: anomalies.length === 0,
      anomalies,
      details,
    };
  }

  /**
   * Analyzes an entire asset bundle and detects duplicate content hashes.
   */
  public static auditAssetBundle(assets: AssetValidationInput[]): {
    totalAssets: number;
    validAssets: number;
    duplicateCount: number;
    anomalies: Array<{ assetId: string; anomaly: AssetAnomalyType; details: string }>;
  } {
    const seenHashes = new Map<string, string>();
    const anomalies: Array<{ assetId: string; anomaly: AssetAnomalyType; details: string }> = [];
    let duplicateCount = 0;
    let validAssets = 0;

    for (const asset of assets) {
      const res = this.validateAsset(asset);
      if (res.isValid) {
        validAssets++;
      } else {
        for (const an of res.anomalies) {
          anomalies.push({ assetId: asset.assetId, anomaly: an, details: res.details.join('; ') });
        }
      }

      // Check duplicate content hashes
      if (seenHashes.has(asset.contentHash)) {
        duplicateCount++;
        anomalies.push({
          assetId: asset.assetId,
          anomaly: 'DUPLICATE_ASSET',
          details: `Identical payload hash to asset "${seenHashes.get(asset.contentHash)}"`,
        });
      } else {
        seenHashes.set(asset.contentHash, asset.assetId);
      }
    }

    return {
      totalAssets: assets.length,
      validAssets,
      duplicateCount,
      anomalies,
    };
  }
}
