import mongoose from 'mongoose';
const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  height: { type: Number, min: 80, max: 250, default: null },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
  profilePhoto: { type: String, default: '' }, address: { type: String, trim: true, default: '' },
  measurementProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement', default: null }
}, { timestamps: true });
export default mongoose.model('Student', studentSchema);
