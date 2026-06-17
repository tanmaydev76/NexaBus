import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  operatorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
  busName:        { type: String, required: true, trim: true },
  busNumber:      { type: String, required: true, trim: true },
  busType:        { type: String, enum: ['Sleeper', 'Seater', 'AC Sleeper', 'AC Seater'], required: true },
  amenities:      [{ type: String }],
  photos:         [{ type: String }],
  boardingPoints: [{
    name:    { type: String, required: true },
    address: { type: String, default: '' },
    time:    { type: String, default: '' },
    _id: false,
  }],
  droppingPoints: [{
    name:    { type: String, required: true },
    address: { type: String, default: '' },
    time:    { type: String, default: '' },
    _id: false,
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Bus = mongoose.models.Bus || mongoose.model('Bus', busSchema);
export default Bus;
