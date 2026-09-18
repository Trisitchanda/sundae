const Expense = require('../models/Expense');
const User = require('../models/User');
const AiInsight = require('../models/AiInsight');
const { z } = require('zod');
const { formatInTimeZone } = require('date-fns-tz');

const expenseSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().int().positive(),
  categoryId: z.string(),
  date: z.string().datetime(), // ISO string from frontend
  notes: z.string().optional().default(''),
  isCreditCard: z.boolean().optional().default(false),
});

exports.getExpenses = async (req, res, next) => {
  try {
    const { year, month, categoryId, sort = 'desc', page = 1, limit = 10, search } = req.query;
    const query = { userId: req.user.id };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);
    if (categoryId) query.categoryId = categoryId;
    
    const sortObj = sort === 'desc' ? { date: -1 } : { date: 1 };
    const skip = (Number(page) - 1) * Number(limit);
    
    const [expenses, total] = await Promise.all([
      Expense.find(query).sort(sortObj).skip(skip).limit(Number(limit)).populate('categoryId', 'name'),
      Expense.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: expenses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const data = expenseSchema.parse(req.body);
    const user = await User.findById(req.user.id).select('timezone');
    
    const tz = user.timezone || 'UTC';
    const dateObj = new Date(data.date);
    const month = Number(formatInTimeZone(dateObj, tz, 'M'));
    const year = Number(formatInTimeZone(dateObj, tz, 'yyyy'));
    
    const expense = await Expense.create({
      ...data,
      userId: req.user.id,
      month,
      year
    });
    
    // Mark AI insights as stale
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });
    
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const data = expenseSchema.partial().parse(req.body);
    
    let updateFields = { ...data };
    if (data.date) {
      const user = await User.findById(req.user.id).select('timezone');
      const tz = user.timezone || 'UTC';
      const dateObj = new Date(data.date);
      updateFields.month = Number(formatInTimeZone(dateObj, tz, 'M'));
      updateFields.year = Number(formatInTimeZone(dateObj, tz, 'yyyy'));
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateFields,
      { new: true }
    );
    
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });

    res.json({ success: true, data: expense });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    next(error);
  }
};
