// Single unified detector for camera-based integrity checks.
// Uses one object-detection model for everything, to avoid loading two
// different TensorFlow.js runtimes in the same page (which can silently
// conflict and stop all detection from running).
//
// Detects ONLY: how many "person" objects are visible, and whether a
// "cell phone" object is visible. No identity, emotion, or attention
// inference — consistent with the project's Responsible AI notice.

let model: import('@tensorflow-models/coco-ssd').ObjectDetection | null = null;
let loadPromise: Promise<void> | null = null;

export function loadDetectionModel(): Promise<void> {
  if (!loadPromise) {
    loadPromise = (async () => {
      await import('@tensorflow/tfjs');
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      model = await cocoSsd.load({ base: 'mobilenet_v2' });
      console.log('[Detection] Model loaded successfully.');
    })().catch((err) => {
      console.error('[Detection] Model failed to load:', err);
      throw err;
    });
  }
  return loadPromise;
}

export interface FrameDetectionResult {
  personCount: number;
  phoneDetected: boolean;
}

export async function detectFrame(video: HTMLVideoElement): Promise<FrameDetectionResult> {
  if (!model) return { personCount: 0, phoneDetected: false };
  if (video.readyState < 2) return { personCount: 0, phoneDetected: false };

  const predictions = await model.detect(video);

  // TEMPORARY DEBUG LOG — remove once phone detection is confirmed working
  console.log('[Detection] Raw predictions:', predictions.map(p => `${p.class} (${(p.score * 100).toFixed(0)}%)`));

  const personCount = predictions.filter(
    (p) => p.class === 'person' && p.score >= 0.5
  ).length;

  const phoneDetected = predictions.some(
    (p) => p.class === 'cell phone' && p.score >= 0.35 // lowered temporarily for debugging
  );

  return { personCount, phoneDetected };
}