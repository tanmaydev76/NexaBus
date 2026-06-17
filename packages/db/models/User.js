import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true, select: false },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  dob: { type: String, default: '' },
}, { timestamps: true });

// Always delete cached model in dev so HMR schema changes take effect
if (process.env.NODE_ENV === 'development') delete mongoose.models.User;
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
