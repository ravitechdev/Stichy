import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let landmarker;
// This version must match the pinned npm package. A WASM/JS version mismatch prevents MediaPipe from starting.
const TASKS_VISION_VERSION = '0.10.35';
const wasmUrl = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`;
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task';

export async function initializePoseLandmarker() {
  if (landmarker) return landmarker;
  const vision = await FilesetResolver.forVisionTasks(wasmUrl);
  landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: modelUrl }, runningMode: 'VIDEO', numPoses: 1,
    minPoseDetectionConfidence: 0.6, minPosePresenceConfidence: 0.6, minTrackingConfidence: 0.6
  });
  return landmarker;
}
export function detectPose(video) { if (!landmarker || video.readyState < 2) return null; return landmarker.detectForVideo(video, performance.now()).landmarks?.[0] || null; }
export function closePoseLandmarker() { landmarker?.close(); landmarker = null; }
const connections = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[0,11],[0,12]];
export function drawSkeleton(canvas, landmarks) {
  const ctx = canvas.getContext('2d'); const { width, height } = canvas; ctx.clearRect(0, 0, width, height); if (!landmarks) return;
  ctx.lineWidth = Math.max(2, width / 280); ctx.strokeStyle = '#f8c83d'; ctx.fillStyle = '#172033';
  connections.forEach(([a, b]) => { const one = landmarks[a]; const two = landmarks[b]; if (!one || !two || (one.visibility ?? 1) < .45 || (two.visibility ?? 1) < .45) return; ctx.beginPath(); ctx.moveTo(one.x * width, one.y * height); ctx.lineTo(two.x * width, two.y * height); ctx.stroke(); });
  landmarks.forEach((point) => { if ((point.visibility ?? 1) < .45) return; ctx.beginPath(); ctx.arc(point.x * width, point.y * height, Math.max(3, width / 160), 0, Math.PI * 2); ctx.fill(); });
}
