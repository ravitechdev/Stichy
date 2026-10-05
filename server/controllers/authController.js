import User from '../models/User.js';
import Student from '../models/Student.js';
import Tailor from '../models/Tailor.js';
import { createToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function response(res, user, status = 200) { return res.status(status).json({ token: createToken(user._id), user: user.toJSON() }); }

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'student' } = req.body;
  if (role === 'admin') return res.status(403).json({ message: 'Admin accounts cannot be registered publicly.' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, password, phone, role });
  if (role === 'tailor') await Tailor.create({ userId: user._id }); else await Student.create({ userId: user._id });
  response(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password || ''))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (!user.isActive) return res.status(403).json({ message: 'This account has been disabled.' });
  response(res, user);
});

export const me = asyncHandler(async (req, res) => {
  const profile = req.user.role === 'student'
    ? await Student.findOne({ userId: req.user._id }).populate('collegeId', 'name location')
    : req.user.role === 'tailor' ? await Tailor.findOne({ userId: req.user._id }) : null;
  res.json({ user: req.user, profile });
});
