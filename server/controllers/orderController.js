import Student from '../models/Student.js';
import Tailor from '../models/Tailor.js';
import Product from '../models/Product.js';
import Measurement from '../models/Measurement.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateOrder = (query) => query.populate('studentId', 'height address').populate({ path: 'tailorId', populate: { path: 'userId', select: 'name phone' } }).populate('collegeId', 'name').populate('measurementId');
const availableStatuses = ['placed', 'accepted', 'measurement_review', 'stitching', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export const createOrder = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id }); if (!student) return res.status(403).json({ message: 'Only students can place orders.' });
  const { tailorId, measurementId, items, address } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(422).json({ message: 'At least one uniform item is required.' });
  if (!(await Tailor.exists({ _id: tailorId }))) return res.status(404).json({ message: 'Tailor not found.' });
  const measurement = await Measurement.findOne({ _id: measurementId, studentId: student._id });
  if (!measurement || !measurement.verifiedByUser) return res.status(422).json({ message: 'Select a measurement profile verified by you before ordering.' });
  const products = await Product.find({ _id: { $in: items.map((item) => item.productId) }, available: true });
  if (products.length !== items.length) return res.status(422).json({ message: 'One or more selected uniforms are unavailable.' });
  const productById = new Map(products.map((product) => [String(product._id), product]));
  const normalizedItems = items.map((item) => { const product = productById.get(String(item.productId)); const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1)); return { productId: product._id, name: product.name, quantity, unitPrice: product.price }; });
  const collegeId = products[0].collegeId; if (!products.every((product) => String(product.collegeId) === String(collegeId))) return res.status(422).json({ message: 'An order may contain uniforms from only one college.' });
  const totalAmount = normalizedItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const order = await Order.create({ studentId: student._id, tailorId, collegeId, measurementId, items: normalizedItems, totalAmount, address, statusHistory: [{ status: 'placed', note: 'Order placed by student.' }] });
  res.status(201).json(await populateOrder(Order.findById(order._id)));
});

export const listOrders = asyncHandler(async (req, res) => {
  let filter = {}; if (req.user.role === 'student') { const student = await Student.findOne({ userId: req.user._id }); filter.studentId = student?._id; }
  if (req.user.role === 'tailor') { const tailor = await Tailor.findOne({ userId: req.user._id }); filter.tailorId = tailor?._id; }
  res.json(await populateOrder(Order.find(filter).sort('-createdAt')));
});
export const getOrder = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findById(req.params.id)); if (!order) return res.status(404).json({ message: 'Order not found.' });
  const student = req.user.role === 'student' ? await Student.findOne({ userId: req.user._id }) : null; const tailor = req.user.role === 'tailor' ? await Tailor.findOne({ userId: req.user._id }) : null;
  if (req.user.role !== 'admin' && String(order.studentId._id) !== String(student?._id) && String(order.tailorId._id) !== String(tailor?._id)) return res.status(403).json({ message: 'Not permitted.' }); res.json(order);
});
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (!availableStatuses.includes(req.body.status)) return res.status(422).json({ message: 'Invalid order status.' });
  if (req.user.role === 'tailor') { const tailor = await Tailor.findOne({ userId: req.user._id }); if (!tailor || String(order.tailorId) !== String(tailor._id)) return res.status(403).json({ message: 'Not permitted.' }); }
  if (!['tailor', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Only the assigned tailor can change order status.' });
  order.status = req.body.status; order.statusHistory.push({ status: req.body.status, note: req.body.note || '' }); await order.save(); res.json(await populateOrder(Order.findById(order._id)));
});

export const createReview = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id }); const order = await Order.findOne({ _id: req.body.orderId, studentId: student?._id, status: 'delivered' });
  if (!order) return res.status(422).json({ message: 'A review can only be submitted for your delivered order.' });
  const review = await Review.create({ studentId: student._id, tailorId: order.tailorId, orderId: order._id, rating: req.body.rating, comment: req.body.comment });
  const stats = await Review.aggregate([{ $match: { tailorId: order.tailorId } }, { $group: { _id: '$tailorId', average: { $avg: '$rating' } } }]); await Tailor.findByIdAndUpdate(order.tailorId, { rating: Number(stats[0].average.toFixed(1)) }); res.status(201).json(review);
});
export const listTailorReviews = asyncHandler(async (req, res) => res.json(await Review.find({ tailorId: req.params.tailorId }).populate('studentId', 'userId').sort('-createdAt')));
