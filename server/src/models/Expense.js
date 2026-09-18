const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true }, // integer minor units
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: true }, // canonical
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    notes: { type: String, default: '' },
    isCreditCard: { type: Boolean, default: false },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, categoryId: 1 });
expenseSchema.index({ userId: 1, year: 1, month: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
