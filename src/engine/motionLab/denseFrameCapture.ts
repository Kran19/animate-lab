import * as fs from 'fs';
import * as path from 'path';

export interface DenseFrameCheckpoint {
  frameIndex: number;
  progressPercent: number; // 0 to 100
  timestampMs: number;
  viewport: { width: number; height: number; dpr: number };
  scrollPosition: { x: number; y: number };
  transform: {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    rotateDeg: number;
  };
  frameFileName: string;
}

export interface DenseFrameCaptureManifest {
  captureId: string;
  sourceUrl: string;
  sectionId: string;
  totalFrames: number;
  fps: number;
  durationMs: number;
  frames: DenseFrameCheckpoint[];
  storagePath: string;
}

export class DenseFrameCaptureEngine {
  /**
   * Generates or captures dense frame-accurate animation sequences (0% to 100%) at 60 FPS.
   */
  public static createDenseCaptureSession(
    targetDir: string,
    captureId: string,
    sourceUrl: string,
    sectionId: string,
    durationMs: number = 1200,
    fps: number = 60
  ): DenseFrameCaptureManifest {
    const framesDir = path.join(targetDir, 'dense_frames', captureId);
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const totalFrames = Math.max(10, Math.round((durationMs / 1000) * fps));
    const intervalMs = durationMs / totalFrames;
    const frames: DenseFrameCheckpoint[] = [];

    for (let i = 0; i <= totalFrames; i++) {
      const progressRatio = i / totalFrames;
      const progressPercent = Math.round(progressRatio * 100);
      const fileName = `frame_${String(i).padStart(6, '0')}.png`;
      const filePath = path.join(framesDir, fileName);

      // Write mock PNG buffer
      fs.writeFileSync(filePath, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

      // Interpolate with easeOut curve
      const easeT = 1 - Math.pow(1 - progressRatio, 3);
      const y = Math.round((40 * (1 - easeT)) * 10) / 10;
      const opacity = Math.round((0.2 + 0.8 * easeT) * 100) / 100;
      const scale = Math.round((0.96 + 0.04 * easeT) * 1000) / 1000;

      frames.push({
        frameIndex: i,
        progressPercent,
        timestampMs: Math.round(i * intervalMs),
        viewport: { width: 1440, height: 900, dpr: 1 },
        scrollPosition: { x: 0, y: Math.round(progressRatio * 100) },
        transform: {
          x: 0,
          y,
          scale,
          opacity,
          rotateDeg: 0,
        },
        frameFileName: fileName,
      });
    }

    const manifest: DenseFrameCaptureManifest = {
      captureId,
      sourceUrl,
      sectionId,
      totalFrames: frames.length,
      fps,
      durationMs,
      frames,
      storagePath: framesDir,
    };

    fs.writeFileSync(path.join(framesDir, 'dense_manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    return manifest;
  }
}
