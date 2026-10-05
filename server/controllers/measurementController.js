import Student from '../models/Student.js';
import MeasurementSession from '../models/MeasurementSession.js';
import Measurement from '../models/Measurement.js';
import Order from '../models/Order.js';
import Tailor from '../models/Tailor.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const metricNames = ['height', 'shoulder', 'chest', 'waist', 'hip', 'neck', 'sleeve', 'armLength', 'torsoLength', 'inseam', 'shirtLength', 'pantLength', 'wrist', 'thigh', 'knee', 'ankle'];
async function studentFor(userId) { return Student.findOne({ userId }); }
async function canAccess(measurement, user) {
  if (user.role === 'admin') return true;
  const student = await studentFor(user._id); if (student && String(measurement.studentId) === String(student._id)) return true;
  if (user.role === 'tailor') { const tailor = await Tailor.findOne({ userId: user._id }); return Boolean(tailor && await Order.exists({ tailorId: tailor._id, measurementId: measurement._id })); }
  return false;
}
function normalizedMetrics(input = {}) {
  return Object.fromEntries(metricNames.map((name) => {
    const metric = input[name] || {}; const value = metric.value === '' || metric.value === undefined ? null : Number(metric.value);
    const usable = Number.isFinite(value) && value > 0;
    return [name, { value: usable ? Math.round(value * 10) / 10 : null, unit: 'cm', confidence: Math.max(0, Math.min(100, Number(metric.confidence) || 0)), confidenceLevel: metric.confidenceLevel || (usable ? 'low' : 'unavailable'), source: metric.source || 'AI', verifiedByUser: Boolean(metric.verifiedByUser), verifiedByTailor: Boolean(metric.verifiedByTailor) }];
  }));
}

export const createMeasurement = asyncHandler(async (req, res) => {
  const student = await studentFor(req.user._id); if (!student) return res.status(403).json({ message: 'Only students can save measurement profiles.' });
  const { session = {}, measurements = {}, overallConfidence = 0, verifiedByUser = false, allowTailorAdjustments = false } = req.body;
  if (!session.heightInput || !session.landmarks?.front?.length || !session.landmarks?.side?.length) return res.status(422).json({ message: 'Front and side landmark captures plus entered height are required.' });
  const safeSession = await MeasurementSession.create({ studentId: student._id, heightInput: session.heightInput, frontCapture: session.frontCapture, sideCapture: session.sideCapture, landmarks: session.landmarks, calibration: session.calibration, quality: session.quality, status: verifiedByUser ? 'confirmed' : 'processed' });
  const profile = await Measurement.create({ studentId: student._id, sessionId: safeSession._id, ...normalizedMetrics(measurements), overallConfidence, verifiedByUser, allowTailorAdjustments, source: Object.values(measurements).some((metric) => metric?.source === 'AI + User Correction') ? 'AI + User Correction' : 'AI', verificationStatus: verifiedByUser ? 'user_verified' : 'ai_estimated' });
  student.height = session.heightInput; student.measurementProfile = profile._id; await student.save(); res.status(201).json(profile);
});
export const listMeasurements = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') return res.json(await Measurement.find().populate('studentId', 'height').sort('-createdAt'));
  const student = await studentFor(req.user._id); if (!student) return res.status(403).json({ message: 'Measurement list is available to students or admins.' });
  res.json(await Measurement.find({ studentId: student._id }).sort('-createdAt'));
});
export const getMeasurement = asyncHandler(async (req, res) => { const profile = await Measurement.findById(req.params.id); if (!profile) return res.status(404).json({ message: 'Measurement not found.' }); if (!(await canAccess(profile, req.user))) return res.status(403).json({ message: 'Not permitted.' }); res.json(profile); });
export const updateMeasurement = asyncHandler(async (req, res) => {
  const profile = await Measurement.findById(req.params.id); if (!profile) return res.status(404).json({ message: 'Measurement not found.' }); if (!(await canAccess(profile, req.user))) return res.status(403).json({ message: 'Not permitted.' });
  if (req.user.role === 'tailor') {
    profile.tailorNotes = req.body.tailorNotes ?? profile.tailorNotes;
    if (req.body.requestRemeasurement) {
      profile.verifiedByTailor = false;
      profile.verificationStatus = 'remeasurement_requested';
    } else {
      for (const [name, update] of Object.entries(req.body.measurements || {})) {
        if (!profile.allowTailorAdjustments) return res.status(403).json({ message: 'The student has not permitted tailor measurement adjustments.' });
        if (!metricNames.includes(name) || !Number.isFinite(Number(update.value)) || Number(update.value) <= 0) continue;
        profile[name].value = Number(update.value);
        profile[name].source = 'Tailor Adjustment';
        profile[name].verifiedByTailor = true;
      }
      if (req.body.verifiedByTailor) { profile.verifiedByTailor = true; profile.verificationStatus = 'tailor_verified'; }
    }
  }
  else if (req.user.role === 'student') { for (const [name, update] of Object.entries(req.body.measurements || {})) { if (!metricNames.includes(name) || !Number.isFinite(Number(update.value)) || Number(update.value) <= 0) continue; profile[name].value = Number(update.value); profile[name].source = 'AI + User Correction'; profile[name].verifiedByUser = true; } if (req.body.verifiedByUser) { profile.verifiedByUser = true; profile.verificationStatus = 'user_verified'; } }
  await profile.save(); res.json(profile);
});
export const deleteMeasurement = asyncHandler(async (req, res) => { const profile = await Measurement.findById(req.params.id); if (!profile) return res.status(404).json({ message: 'Measurement not found.' }); const student = await studentFor(req.user._id); if (req.user.role !== 'admin' && (!student || String(profile.studentId) !== String(student._id))) return res.status(403).json({ message: 'Not permitted.' }); await MeasurementSession.deleteOne({ _id: profile.sessionId }); await profile.deleteOne(); res.status(204).end(); });
