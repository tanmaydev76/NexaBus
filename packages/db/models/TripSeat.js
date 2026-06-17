import mongoose from 'mongoose';

const tripSeatSchema = new mongoose.Schema({
  tripId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  seatNumber:  { type: String, required: true },
  seatId:      { type: String, required: true },
  status:      { type: String, enum: ['available', 'booked', 'blocked', 'ladies', 'reserved'], default: 'available' },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
}, { timestamps: true });

tripSeatSchema.index({ tripId: 1, seatId: 1 }, { unique: true });

const TripSeat = mongoose.models.TripSeat || mongoose.model('TripSeat', tripSeatSchema);
export default TripSeat;
