const Joi = require('joi');
const Transaction = require('../models/Transaction');

const transactionSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Title is required.',
    'string.min': 'Title must be at least 1 character.',
    'string.max': 'Title must be less than 100 characters.'
  }),
  description: Joi.string().allow('').optional(),
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a number.',
    'number.positive': 'Amount must be positive.',
    'any.required': 'Amount is required.'
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type must be either income or expense.',
    'any.required': 'Type is required.'
  })
});

exports.createTransaction = async (req, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) {
    console.error(error.details[0].message);
    return res.redirect('/dashboard');
  }
  const { title, description, amount, type } = req.body;
  try {
    const newTx = new Transaction({ user: req.user.id, title, description, amount, type });
    await newTx.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};

exports.editTransaction = async (req, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) {
    console.error(error.details[0].message);
    return res.redirect('/dashboard');
  }
  const { title, description, amount, type } = req.body;
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.redirect('/dashboard');
    if (tx.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.send('Access denied.');
    tx.title = title;
    tx.description = description;
    tx.amount = amount;
    tx.type = type;
    await tx.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.redirect('/dashboard');
    if (tx.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.send('Access denied.');
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};
