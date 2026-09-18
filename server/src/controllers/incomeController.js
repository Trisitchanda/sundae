const Income = require('../models/Income');
const { z } = require('zod');

const incomeSchema = z.object({
  amount: z.number().int().positive(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  type: z.string().min(1),
});

exports.getIncome = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const query = { userId: req.user.id };
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);
    
    const incomes = await Income.find(query).sort({ year: -1, month: -1 });
    res.json({ success: true, data: incomes });
  } catch (error) {
    next(error);
  }
};

exports.createOrUpdateIncome = async (req, res, next) => {
  try {
    const { amount, month, year, type } = incomeSchema.parse(req.body);
    
    const income = await Income.findOneAndUpdate(
      { userId: req.user.id, month, year },
      { amount, type },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, data: income });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    next(error);
  }
};
