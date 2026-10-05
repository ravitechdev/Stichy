import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  name: { type: String, required: true, trim: true }, category: { type: String, required: true, trim: true },
  description: { type: String, default: '' }, price: { type: Number, required: true, min: 0 }, image: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' }, available: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Product', productSchema);
