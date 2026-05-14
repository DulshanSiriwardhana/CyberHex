import mongoose from 'mongoose';

const RevokedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  revokedAt: { type: Date, default: Date.now, expires: '7d' },
});

export default mongoose.model('RevokedToken', RevokedTokenSchema);