import mongoose from 'mongoose';

const stopPointSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  time:          { type: String, default: '' },
  landmark:      { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  order:         { type: Number, default: 0 },
}, { _id: true });

const routeSchema = new mongoose.Schema({
  operatorId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
  routeName:          { type: String, trim: true, default: '' },
  routeNumber:        { type: String, trim: true, default: '' },
  origin:             { type: String, required: true, trim: true },
  destination:        { type: String, required: true, trim: true },
  estimatedDuration:  { type: String, default: '' },
  distance:           { type: Number, default: 0 },
  stops: [{
    name:          { type: String, required: true },
    address:       { type: String, default: '' },
    arrivalTime:   { type: String, default: '' },
    departureTime: { type: String, default: '' },
    offsetMinutes: { type: Number, default: 0 },
    _id: false,
  }],
  boardingPoints: { type: [stopPointSchema], default: [] },
  droppingPoints: { type: [stopPointSchema], default: [] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
