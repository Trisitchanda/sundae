const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // null for default categories
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    budgetLimit: { type: Number, default: null, min: 0 }
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
