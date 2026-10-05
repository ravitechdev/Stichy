import 'dotenv/config';
import { connectDatabase } from '../config/database.js';
import College from '../models/College.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Tailor from '../models/Tailor.js';

await connectDatabase();
let college = await College.findOne({ name: 'Stichy Demo College' });
if (!college) college = await College.create({ name: 'Stichy Demo College', location: 'Campus Road', description: 'Demo catalogue for local development.', uniformCategories: ['Shirts', 'Trousers', 'Blazers'] });
if (!(await Product.exists({ collegeId: college._id }))) await Product.insertMany([
  { collegeId: college._id, name: 'Classic Uniform Shirt', category: 'Shirt', description: 'Custom stitched college shirt.', price: 650, gender: 'unisex' },
  { collegeId: college._id, name: 'Formal Uniform Trouser', category: 'Trouser', description: 'Custom stitched uniform trouser.', price: 850, gender: 'unisex' },
  { collegeId: college._id, name: 'College Blazer', category: 'Blazer', description: 'Tailored formal blazer.', price: 2200, gender: 'unisex' }
]);
let user = await User.findOne({ email: 'tailor@stichy.local' });
if (!user) { user = await User.create({ name: 'Stichy Demo Tailor', email: 'tailor@stichy.local', password: 'TailorDemo123', phone: '9999999999', role: 'tailor' }); await Tailor.create({ userId: user._id, businessName: 'Perfect Stitch Studio', specialization: ['College uniforms', 'Alterations'], location: 'Campus Road', experience: 8, rating: 4.8, verified: true }); }
console.log('Seed complete. Demo tailor: tailor@stichy.local / TailorDemo123'); process.exit(0);
