import * as fs from 'fs';
import * as path from 'path';

export interface FrameMetadata {
  frameIndex: number;
  frameFileName: string;
  timestampMs: number;
  viewport: { width: number; height: number; dpr: number };
  scrollPosition: { x: number; y: number };
  activeSectionId: string;
  stimulusState: string;
}

export interface FrameSequenceManifest {
  captureId: string;
  sourceUrl: string;
  sectionId: string;
  totalFrames: number;
  fps: number;
  durationMs: number;
  frames: FrameMetadata[];
  storagePath: string;
}

export class FrameCaptureEngine {
  /**
   * Initializes and writes a deterministic frame sequence capture session to disk.
   */
  public static createCaptureSession(
    targetDir: string,
    captureId: string,
    sourceUrl: string,
    sectionId: string,
    totalFrames: number = 30,
    fps: number = 60
  ): FrameSequenceManifest {
    const framesDir = path.join(targetDir, 'frames', captureId);
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const frameList: FrameMetadata[] = [];
    const intervalMs = Math.round(1000 / fps);

    for (let i = 0; i < totalFrames; i++) {
      const fileName = `frame_${String(i + 1).padStart(6, '0')}.png`;
      const filePath = path.join(framesDir, fileName);

      // Write mock frame buffer (1x1 transparent PNG header or placeholder bytes)
      fs.writeFileSync(filePath, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

      frameList.push({
        frameIndex: i + 1,
        frameFileName: fileName,
        timestampMs: i * intervalMs,
        viewport: { width: 1440, height: 900, dpr: 1 },
        scrollPosition: { x: 0, y: i * 20 },
        activeSectionId: sectionId,
        stimulusState: i === 0 ? 'INITIAL' : i < 15 ? 'ANIMATING' : 'SETTLED',
      });
    }

    const manifest: FrameSequenceManifest = {
      captureId,
      sourceUrl,
      sectionId,
      totalFrames,
      fps,
      durationMs: totalFrames * intervalMs,
      frames: frameList,
      storagePath: framesDir,
    };

    fs.writeFileSync(path.join(framesDir, 'sequence.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    return manifest;
  }
}
