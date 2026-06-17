import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  operatorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
  busId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  layoutId:      { type: mongoose.Schema.Types.ObjectId, ref: 'SeatLayout', required: true },
  departureDate: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime:   { type: String, required: true },
  status:        { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
  recurringDays: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
  fare:          { type: Number, required: true },
}, { timestamps: true });

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
export default Trip;
