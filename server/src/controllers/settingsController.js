const User = require('../models/User');
const AiInsight = require('../models/AiInsight');

exports.updateIncome = async (req, res, next) => {
  try {
    const { baseSalary } = req.body;
    
    if (baseSalary === undefined || isNaN(baseSalary) || baseSalary < 0) {
      return res.status(400).json({ success: false, message: 'Invalid base salary' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { baseSalary: Math.round(Number(baseSalary) * 100) },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateSavingsGoal = async (req, res, next) => {
  try {
    const { savingsGoalRate } = req.body;
    
    if (savingsGoalRate === undefined || isNaN(savingsGoalRate) || savingsGoalRate < 0 || savingsGoalRate > 100) {
      return res.status(400).json({ success: false, message: 'Invalid savings goal rate (must be 0-100)' });
    }

    const rateAsDecimal = Number(savingsGoalRate) / 100;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { savingsGoalRate: rateAsDecimal },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Invalidate AI cache
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
