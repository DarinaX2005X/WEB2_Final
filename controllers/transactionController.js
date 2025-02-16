const Joi = require('joi');
const Transaction = require('../models/Transaction');

const transactionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  amount: Joi.number().required(),
  type: Joi.string().valid('income', 'expense').required()
});

exports.createTransaction = async (req, res, next) => {
  try {
    const { error } = transactionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { title, description, amount, type } = req.body;
    const newTransaction = new Transaction({ user: req.user.id, title, description, amount, type });
    await newTransaction.save();
    res.status(201).json({ transaction: newTransaction });
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    let transactions;
    if (req.user.role === 'admin') {
      transactions = await Transaction.find({}).sort({ date: -1 });
    } else {
      transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    }
    res.status(200).json({ transactions });
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found.' });
    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { error } = transactionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found.' });
    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });
    const { title, description, amount, type } = req.body;
    transaction.title = title;
    transaction.description = description;
    transaction.amount = amount;
    transaction.type = type;
    await transaction.save();
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found.' });
    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
