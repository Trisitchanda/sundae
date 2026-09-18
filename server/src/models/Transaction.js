const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['EXPENSE', 'INCOME', 'TRANSFER', 'REFUND'], 
      required: true 
    },
    amount: { type: Number, required: true }, // integer minor units
    date: { type: Date, required: true }, // canonical
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    description: { type: String, required: true },
    
    // For EXPENSE, INCOME, REFUND
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    
    // For TRANSFER
    sourceAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    destinationAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    
    // For REFUND
    originalTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });
transactionSchema.index({ userId: 1, year: 1, month: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, accountId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
