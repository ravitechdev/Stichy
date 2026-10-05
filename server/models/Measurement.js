import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  value: { type: Number, default: null }, unit: { type: String, default: 'cm' },
  confidence: { type: Number, min: 0, max: 100, default: 0 },
  confidenceLevel: { type: String, enum: ['high', 'medium', 'low', 'unavailable'], default: 'unavailable' },
  source: { type: String, enum: ['AI', 'AI + User Correction', 'Manual', 'Tailor Adjustment'], default: 'AI' },
  verifiedByUser: { type: Boolean, default: false }, verifiedByTailor: { type: Boolean, default: false }
}, { _id: false });
const metricNames = ['height', 'shoulder', 'chest', 'waist', 'hip', 'neck', 'sleeve', 'armLength', 'torsoLength', 'inseam', 'shirtLength', 'pantLength', 'wrist', 'thigh', 'knee', 'ankle'];
const metricFields = Object.fromEntries(metricNames.map((name) => [name, { type: metricSchema, default: () => ({ value: null, source: 'AI' }) }]));
const measurementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MeasurementSession', required: true },
  ...metricFields,
  overallConfidence: { type: Number, min: 0, max: 100, default: 0 },
  source: { type: String, enum: ['AI', 'AI + User Correction', 'Manual'], default: 'AI' },
  allowTailorAdjustments: { type: Boolean, default: false },
  verifiedByUser: { type: Boolean, default: false }, verifiedByTailor: { type: Boolean, default: false },
  tailorNotes: { type: String, default: '' }, verificationStatus: { type: String, enum: ['ai_estimated', 'user_verified', 'tailor_verified', 'remeasurement_requested'], default: 'ai_estimated' }
}, { timestamps: true });
export default mongoose.model('Measurement', measurementSchema);
