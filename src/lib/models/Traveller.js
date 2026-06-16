import mongoose from 'mongoose';

const travellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  age: { type: Number, required: true, min: 1, max: 120 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  mobileNumber: { type: String, required: true },
  emailAddress: { type: String, lowercase: true, trim: true, default: null },
  isPrimary: { type: Boolean, default: false },
  isFrequentTraveller: { type: Boolean, default: false },
  lastUsedAt: { type: Date, default: Date.now },
  bookingCount: { type: Number, default: 0 },
}, { timestamps: true });

if (process.env.NODE_ENV === 'development') delete mongoose.models.Traveller;
const Traveller = mongoose.models.Traveller || mongoose.model('Traveller', travellerSchema);
export default Traveller;
