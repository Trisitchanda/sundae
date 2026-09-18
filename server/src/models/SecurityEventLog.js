const mongoose = require('mongoose');

const securityEventLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SecurityEventLog', securityEventLogSchema);
