import mongoose, { Schema } from 'mongoose';

const OtpSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OtpSchema.index({ email: 1, createdAt: -1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OtpSchema.statics.generateCode = function () {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export default mongoose.model('Otp', OtpSchema);