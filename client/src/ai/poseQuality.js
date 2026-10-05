const important = { head: [0], shoulders: [11, 12], arms: [13, 14, 15, 16], hips: [23, 24], legs: [25, 26, 27, 28], feet: [27, 28] };
const visible = (point) => point && (point.visibility ?? point.presence ?? 1) >= .55;
const avg = (points) => points.reduce((sum, point) => sum + (point.visibility ?? point.presence ?? 1), 0) / points.length;

export function frameBrightness(video) {
  const canvas = document.createElement('canvas'); canvas.width = 48; canvas.height = 36; const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(video, 0, 0, 48, 36); const data = ctx.getImageData(0, 0, 48, 36).data;
  let total = 0; for (let index = 0; index < data.length; index += 4) total += .2126 * data[index] + .7152 * data[index + 1] + .0722 * data[index + 2]; return total / (data.length / 4);
}
export function poseStability(frames) {
  if (frames.length < 6) return 0; const selected = [0, 11, 12, 23, 24, 27, 28]; const newest = frames.at(-1); let variation = 0; let count = 0;
  frames.slice(-10, -1).forEach((frame) => selected.forEach((index) => { if (frame[index] && newest[index]) { variation += Math.hypot(frame[index].x - newest[index].x, frame[index].y - newest[index].y); count += 1; } }));
  return count ? Math.max(0, Math.min(1, 1 - variation / count / .04)) : 0;
}
export function evaluatePose(landmarks, brightness, stability = 0) {
  if (!landmarks) return { ready: false, score: 0, checks: [{ label: 'Person detected', pass: false, hint: 'Stand in front of the camera.' }] };
  const groupVisible = (group) => important[group].every((index) => visible(landmarks[index]));
  const shoulderY = (landmarks[11].y + landmarks[12].y) / 2; const hipY = (landmarks[23].y + landmarks[24].y) / 2;
  const bodyHeight = ((landmarks[27].y + landmarks[28].y) / 2) - landmarks[0].y; const center = (landmarks[11].x + landmarks[12].x + landmarks[23].x + landmarks[24].x) / 4;
  const shouldersLevel = Math.abs(landmarks[11].y - landmarks[12].y) < .055; const upright = Math.abs(((landmarks[11].x + landmarks[12].x) / 2) - ((landmarks[23].x + landmarks[24].x) / 2)) < .075;
  const checks = [
    { label: 'Head visible', pass: groupVisible('head'), hint: 'Keep your head in the frame.' },
    { label: 'Shoulders and arms detected', pass: groupVisible('shoulders') && groupVisible('arms'), hint: 'Keep arms slightly away from your body.' },
    { label: 'Legs and feet visible', pass: groupVisible('legs') && groupVisible('feet'), hint: 'Move farther away so your full body is visible.' },
    { label: 'Centered at the right distance', pass: bodyHeight > .55 && bodyHeight < .94 && center > .30 && center < .70, hint: bodyHeight >= .94 ? 'Move farther away.' : bodyHeight <= .55 ? 'Move closer.' : 'Stand in the center.' },
    { label: 'Standing straight', pass: shouldersLevel && upright && hipY > shoulderY, hint: 'Stand straight and keep shoulders level.' },
    { label: 'Good lighting', pass: brightness >= 55 && brightness <= 225, hint: brightness < 55 ? 'Move to a brighter location.' : 'Avoid strong backlighting.' },
    { label: 'Stable pose', pass: stability >= .72, hint: 'Hold still for a moment.' }
  ];
  const landmarkQuality = avg([0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map((index) => landmarks[index]));
  const score = Math.round(100 * (.45 * landmarkQuality + .35 * stability + .20 * checks.filter((check) => check.pass).length / checks.length));
  return { ready: checks.every((check) => check.pass), score, checks, bodyHeightRatio: bodyHeight, landmarkQuality };
}
