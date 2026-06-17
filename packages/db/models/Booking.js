import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  seatNumber: { type: String, required: true },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
  savedTravellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveller', default: null },
  saveTraveller: { type: Boolean, default: false },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: String, required: true, unique: true },
  busId: { type: String, required: true },
  busName: { type: String, required: true },
  busType: { type: String, default: '' },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  departure: { type: String, default: '' },
  arrival: { type: String, default: '' },
  boardingPoint: { type: String, default: '' },
  droppingPoint: { type: String, default: '' },
  seats: [{ number: String, id: String }],
  passengers: [passengerSchema],
  baseFare: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  cancelledAt: { type: Date, default: null },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', default: null },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
