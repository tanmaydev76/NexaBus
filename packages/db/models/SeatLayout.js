import mongoose from 'mongoose';

const seatLayoutSchema = new mongoose.Schema({
  operatorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
  busId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  layoutName:  { type: String, required: true, trim: true },
  config:      { type: String, enum: ['1+1', '2+1', '2+2'], required: true },
  totalSeats:  { type: Number, required: true },
  rows:        { type: mongoose.Schema.Types.Mixed, required: true },
  isTemplate:  { type: Boolean, default: false },
}, { timestamps: true });

const SeatLayout = mongoose.models.SeatLayout || mongoose.model('SeatLayout', seatLayoutSchema);
export default SeatLayout;
