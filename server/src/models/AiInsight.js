import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, required: true }, // e.g., '2023-10'
    savingsGoal: { type: String, default: null },
    insightData: { type: Object, required: true }, // Structured JSON from Gemini
    budgetSnapshot: { type: Object }, // Deterministic budget context analyzed
    isStale: { type: Boolean, default: false },
    isGenerating: { type: Boolean, default: false },
    generatedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index to automatically remove cached insights
aiInsightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for quick lookup
aiInsightSchema.index({ userId: 1, period: 1 });

export default mongoose.model('AiInsight', aiInsightSchema);
