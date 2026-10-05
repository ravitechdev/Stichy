import mongoose from 'mongoose';
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, name: String,
  quantity: { type: Number, min: 1, default: 1 }, unitPrice: { type: Number, min: 0, required: true }
}, { _id: false });
const orderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  items: { type: [orderItemSchema], validate: (items) => items.length > 0 },
  measurementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement', required: true },
  totalAmount: { type: Number, required: true, min: 0 }, address: { type: String, required: true, trim: true },
  status: { type: String, enum: ['placed', 'accepted', 'measurement_review', 'stitching', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed' },
  statusHistory: [{ status: String, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
