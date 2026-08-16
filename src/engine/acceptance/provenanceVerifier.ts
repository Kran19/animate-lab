import * as crypto from 'crypto';
import * as fs from 'fs';

export type ProvenanceStage = 'SOURCE' | 'EVIDENCE' | 'FIR' | 'ANALYSIS' | 'SYNTHESIS' | 'REPLAY' | 'CERTIFICATION';

export interface ProvenanceNode {
  nodeId: string;
  stage: ProvenanceStage;
  artifactId: string;
  parentArtifactIds: string[];
  sha256: string;
  timestamp: string;
  toolVersion: string;
  schemaVersion: string;
}

export interface ProvenanceAuditResult {
  valid: boolean;
  totalNodes: number;
  unbrokenChain: boolean;
  tamperedNodes: string[];
  chainHistory: ProvenanceNode[];
  auditedAt: string;
}

export class ProvenanceVerifier {
  /**
   * Generates a SHA-256 checksum from string content or file buffer.
   */
  public static hashContent(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Creates an immutable provenance record for an artifact in the extraction pipeline.
   */
  public static createNode(
    stage: ProvenanceStage,
    artifactId: string,
    content: string | Buffer,
    parentArtifactIds: string[] = [],
    schemaVersion: string = '0.1.0'
  ): ProvenanceNode {
    const sha256 = this.hashContent(content);
    return {
      nodeId: `prov_${stage.toLowerCase()}_${sha256.substring(0, 12)}`,
      stage,
      artifactId,
      parentArtifactIds,
      sha256,
      timestamp: new Date().toISOString(),
      toolVersion: '1.0.0',
      schemaVersion,
    };
  }

  /**
   * Verifies the cryptographic integrity of a sequence of provenance nodes.
   */
  public static auditChain(nodes: ProvenanceNode[], currentArtifactMap: Record<string, string | Buffer>): ProvenanceAuditResult {
    const tampered: string[] = [];

    for (const node of nodes) {
      const liveContent = currentArtifactMap[node.artifactId];
      if (!liveContent) {
        tampered.push(`${node.artifactId} (MISSING_ARTIFACT)`);
        continue;
      }
      const liveHash = this.hashContent(liveContent);
      if (liveHash !== node.sha256) {
        tampered.push(`${node.artifactId} (HASH_MISMATCH: expected ${node.sha256}, got ${liveHash})`);
      }
    }

    const valid = tampered.length === 0 && nodes.length > 0;

    return {
      valid,
      totalNodes: nodes.length,
      unbrokenChain: valid,
      tamperedNodes: tampered,
      chainHistory: nodes,
      auditedAt: new Date().toISOString(),
    };
  }
}
