import mongoose from 'mongoose';

const captureSchema = new mongoose.Schema({
  capturedAt: { type: Date, default: Date.now }, landmarkCount: { type: Number, default: 0 },
  quality: { type: Number, min: 0, max: 100, default: 0 }, frameWidth: Number, frameHeight: Number
}, { _id: false });

const measurementSessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  heightInput: { type: Number, required: true, min: 80, max: 250 },
  frontCapture: { type: captureSchema, default: () => ({}) },
  sideCapture: { type: captureSchema, default: () => ({}) },
  // Landmark coordinates are saved; raw camera frames are deliberately not stored by default.
  landmarks: { front: { type: [mongoose.Schema.Types.Mixed], default: [] }, side: { type: [mongoose.Schema.Types.Mixed], default: [] } },
  calibration: { pixelsPerCm: Number, fullBodyHeightPx: Number },
  quality: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['capturing', 'processed', 'confirmed', 'retake_requested'], default: 'capturing' }
}, { timestamps: true });
export default mongoose.model('MeasurementSession', measurementSessionSchema);
