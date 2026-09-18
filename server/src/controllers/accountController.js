const Account = require('../models/Account');

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    const { name, type, balance, creditLimit } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    const account = await Account.create({
      userId: req.user.id,
      name,
      type,
      balance: balance || 0,
      creditLimit: creditLimit || null
    });
    
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};
