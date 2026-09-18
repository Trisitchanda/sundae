const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    baseSalary: { type: Number, default: 0 },
    savingsGoalRate: { type: Number, default: 0.50 },
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {}
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
