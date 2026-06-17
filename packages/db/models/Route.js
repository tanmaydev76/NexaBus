import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  operatorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
  origin:      { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  distance:    { type: Number, default: 0 },
  stops: [{
    name:          { type: String, required: true },
    address:       { type: String, default: '' },
    offsetMinutes: { type: Number, default: 0 },
    _id: false,
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
