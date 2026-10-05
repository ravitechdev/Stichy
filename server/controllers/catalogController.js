import College from '../models/College.js';
import Product from '../models/Product.js';
import Student from '../models/Student.js';
import Tailor from '../models/Tailor.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const requireRecord = (record, label) => { if (!record) { const error = new Error(`${label} not found.`); error.statusCode = 404; throw error; } return record; };

export const listColleges = asyncHandler(async (req, res) => res.json(await College.find().sort('name')));
export const getCollege = asyncHandler(async (req, res) => res.json(requireRecord(await College.findById(req.params.id), 'College')));
export const createCollege = asyncHandler(async (req, res) => res.status(201).json(await College.create(req.body)));
export const updateCollege = asyncHandler(async (req, res) => res.json(requireRecord(await College.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }), 'College')));
export const deleteCollege = asyncHandler(async (req, res) => { requireRecord(await College.findByIdAndDelete(req.params.id), 'College'); res.status(204).end(); });

export const listProducts = asyncHandler(async (req, res) => {
  const filter = {}; if (req.query.collegeId) filter.collegeId = req.query.collegeId; if (req.query.category) filter.category = req.query.category; if (req.query.gender) filter.gender = { $in: [req.query.gender, 'unisex'] }; if (req.query.available !== 'all') filter.available = true;
  res.json(await Product.find(filter).populate('collegeId', 'name').sort('-createdAt'));
});
export const getProduct = asyncHandler(async (req, res) => res.json(requireRecord(await Product.findById(req.params.id).populate('collegeId', 'name'), 'Product')));
export const createProduct = asyncHandler(async (req, res) => res.status(201).json(await Product.create(req.body)));
export const updateProduct = asyncHandler(async (req, res) => res.json(requireRecord(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }), 'Product')));
export const deleteProduct = asyncHandler(async (req, res) => { requireRecord(await Product.findByIdAndDelete(req.params.id), 'Product'); res.status(204).end(); });

export const getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email phone role').populate('collegeId', 'name location');
  res.json(requireRecord(profile, 'Student profile'));
});
export const updateStudentProfile = asyncHandler(async (req, res) => {
  const allowed = ['collegeId', 'height', 'gender', 'profilePhoto', 'address']; const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const profile = await Student.findOneAndUpdate({ userId: req.user._id }, updates, { new: true, runValidators: true }); res.json(requireRecord(profile, 'Student profile'));
});

export const listTailors = asyncHandler(async (req, res) => res.json(await Tailor.find().populate('userId', 'name email phone').sort({ verified: -1, rating: -1 })));
export const getTailor = asyncHandler(async (req, res) => res.json(requireRecord(await Tailor.findById(req.params.id).populate('userId', 'name email phone'), 'Tailor')));
export const updateTailorProfile = asyncHandler(async (req, res) => {
  const allowed = ['businessName', 'specialization', 'location', 'experience']; const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const profile = await Tailor.findOneAndUpdate({ userId: req.user._id }, updates, { new: true, runValidators: true }); res.json(requireRecord(profile, 'Tailor profile'));
});

export const adminUsers = asyncHandler(async (req, res) => res.json(await User.find({}, 'name email phone role isActive createdAt').sort('-createdAt')));
