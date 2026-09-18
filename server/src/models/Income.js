const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true }, // integer minor units
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

incomeSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Income', incomeSchema);
