import mongoose from 'mongoose';
const tailorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, trim: true, default: '' }, specialization: [{ type: String, trim: true }],
  location: { type: String, trim: true, default: '' }, experience: { type: Number, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 }, verified: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Tailor', tailorSchema);
