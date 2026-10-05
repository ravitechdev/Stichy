const px = (point, width, height) => ({ x: point.x * width, y: point.y * height });
const distance = (a, b, width, height) => Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const level = (score, available = true) => !available ? 'unavailable' : score >= 90 ? 'high' : score >= 70 ? 'medium' : 'low';
const metric = (value, score, source = 'AI') => ({ value: Number.isFinite(value) && value > 0 ? Math.round(value * 10) / 10 : null, unit: 'cm', confidence: Number.isFinite(value) && value > 0 ? score : 0, confidenceLevel: level(score, Number.isFinite(value) && value > 0), source, verifiedByUser: false, verifiedByTailor: false });
const unavailable = () => metric(null, 0);

export function estimateMeasurements({ front, side, heightCm }) {
  const width = front.frameWidth; const height = front.frameHeight; const f = front.landmarks; const s = side.landmarks; const frontBodyPx = distance(f[0], midpoint(f[27], f[28]), width, height);
  if (!Number.isFinite(frontBodyPx) || frontBodyPx <= 0) throw new Error('Unable to calibrate body height from the front capture.');
  const cmPerPx = heightCm / frontBodyPx; const confidenceBase = Math.round(Math.min(front.quality.score, side.quality.score) * (.7 + .3 * Math.min(front.stability, side.stability)));
  const shoulder = distance(f[11], f[12], width, height) * cmPerPx;
  const arm = ([shoulderIndex, elbowIndex, wristIndex]) => (distance(f[shoulderIndex], f[elbowIndex], width, height) + distance(f[elbowIndex], f[wristIndex], width, height)) * cmPerPx;
  const leftArm = arm([11, 13, 15]); const rightArm = arm([12, 14, 16]); const shoulderMid = midpoint(f[11], f[12]); const hipMid = midpoint(f[23], f[24]); const ankleMid = midpoint(f[27], f[28]);
  const linearScore = Math.max(0, Math.min(100, confidenceBase)); const armScore = Math.max(0, linearScore - 5);
  // Pose landmarks do not provide a reliable body contour. Circumferences are intentionally null rather than guessed.
  const measurements = {
    height: metric(heightCm, 100, 'Manual'), shoulder: metric(shoulder, linearScore), chest: unavailable(), waist: unavailable(), hip: unavailable(), neck: unavailable(),
    sleeve: metric((leftArm + rightArm) / 2, armScore), armLength: metric((leftArm + rightArm) / 2, armScore), torsoLength: metric(distance(shoulderMid, hipMid, width, height) * cmPerPx, linearScore),
    inseam: metric(distance(hipMid, ankleMid, width, height) * cmPerPx, linearScore - 6), shirtLength: metric(distance(shoulderMid, hipMid, width, height) * cmPerPx, linearScore - 4), pantLength: metric(distance(hipMid, ankleMid, width, height) * cmPerPx, linearScore - 6),
    wrist: unavailable(), thigh: unavailable(), knee: unavailable(), ankle: unavailable()
  };
  return { measurements, overallConfidence: Math.round(Object.values(measurements).filter((item) => item.value !== null).reduce((sum, item) => sum + item.confidence, 0) / Object.values(measurements).filter((item) => item.value !== null).length), session: { heightInput: heightCm, frontCapture: { landmarkCount: f.length, quality: front.quality.score, frameWidth: width, frameHeight: height }, sideCapture: { landmarkCount: s.length, quality: side.quality.score, frameWidth: side.frameWidth, frameHeight: side.frameHeight }, landmarks: { front: f, side: s }, calibration: { pixelsPerCm: frontBodyPx / heightCm, fullBodyHeightPx: frontBodyPx }, quality: { front: front.quality, side: side.quality } } };
}
