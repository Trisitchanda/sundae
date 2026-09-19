import User from '../models/User.js';
import AiInsight from '../models/AiInsight.js';
import AppError from '../utils/AppError.js';
import { invalidateUserCache } from '../middleware/cacheMiddleware.js';

export const updateIncome = async (req, res, next) => {
  try {
    const { baseSalary } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { baseSalary: Math.round(Number(baseSalary) * 100) },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await invalidateUserCache(req.user.id, 'analytics');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateSavingsGoal = async (req, res, next) => {
  try {
    const { savingsGoalRate } = req.body;
    const rateAsDecimal = Number(savingsGoalRate) / 100;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { savingsGoalRate: rateAsDecimal },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Invalidate AI cache and Redis analytics cache
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });
    await invalidateUserCache(req.user.id, 'analytics');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
