import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['BANK', 'CASH', 'CREDIT_CARD', 'WALLET', 'SAVINGS'], 
      required: true 
    },
    balance: { type: Number, default: 0 }, // Positive for bank, positive for outstanding credit card debt
    creditLimit: { type: Number, default: null }, // Applicable for CREDIT_CARD
    isDefault: { type: Boolean, default: false }, // Useful for migration and quick add
  },
  { timestamps: true }
);

export default mongoose.model('Account', accountSchema);
