const Category = require('../models/Category');
const AiInsight = require('../models/AiInsight');
const User = require('../models/User');
const { z } = require('zod');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: req.user.id }, { isDefault: true }]
    }).sort({ name: 1 }).lean();

    const user = await User.findById(req.user.id);
    const budgets = user.categoryBudgets || new Map();

    const mappedCategories = categories.map(cat => ({
      ...cat,
      budgetLimit: budgets.has(cat._id.toString()) ? budgets.get(cat._id.toString()) : null
    }));

    res.json({ success: true, data: mappedCategories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    const category = await Category.create({ userId: req.user.id, name });
    
    // Invalidate AI cache
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });

    res.status(201).json({ success: true, data: { ...category.toObject(), budgetLimit: null } });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Category already exists' });
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { budgetLimit } = z.object({ 
      budgetLimit: z.number().min(0).nullable().optional() 
    }).parse(req.body);

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const user = await User.findById(req.user.id);

    if (budgetLimit === null || budgetLimit === undefined) {
      user.categoryBudgets.delete(id);
    } else {
      user.categoryBudgets.set(id, budgetLimit);
    }

    await user.save();

    // Invalidate AI cache
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });

    res.json({ success: true, data: { ...category.toObject(), budgetLimit } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    next(error);
  }
};
