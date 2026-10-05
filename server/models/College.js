import mongoose from 'mongoose';
const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, location: { type: String, trim: true, default: '' },
  logo: { type: String, default: '' }, description: { type: String, default: '' }, uniformCategories: [{ type: String, trim: true }]
}, { timestamps: true });
export default mongoose.model('College', collegeSchema);
