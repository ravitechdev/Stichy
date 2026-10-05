import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, comment: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });
export default mongoose.model('Review', reviewSchema);
