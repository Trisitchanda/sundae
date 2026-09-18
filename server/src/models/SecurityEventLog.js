import mongoose from 'mongoose';

const securityEventLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('SecurityEventLog', securityEventLogSchema);
