import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  accountNo: { type: String, default: '' },
  ifsc:      { type: String, default: '' },
  bankName:  { type: String, default: '' },
}, { _id: false });

const operatorSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true, select: false },
  phone:       { type: String, default: '' },
  companyName: { type: String, default: '' },
  gstNumber:   { type: String, default: '' },
  logoUrl:     { type: String, default: '' },
  bankAccount: { type: bankAccountSchema, default: () => ({}) },
  upiId:       { type: String, default: '' },
  isVerified:  { type: Boolean, default: false },
}, { timestamps: true });

const Operator = mongoose.models.Operator || mongoose.model('Operator', operatorSchema);
export default Operator;
