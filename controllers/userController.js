const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Joi schema for profile update with custom messages and password change support
const profileSchema = Joi.object({
  username: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Username is required.',
    'string.min': 'Username should be at least 2 characters.',
    'string.max': 'Username should be at most 50 characters.'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.'
  }),
  oldPassword: Joi.string().allow(''),
  newPassword: Joi.when('oldPassword', {
    is: Joi.exist().not('').required(),
    then: Joi.string().min(6).required().messages({
      'string.empty': 'New password must not be empty.',
      'string.min': 'New password must be at least 6 characters.',
      'any.required': 'New password is required if changing your password.'
    }),
    otherwise: Joi.string().optional().allow('')
  }),
  confirmNewPassword: Joi.when('newPassword', {
    is: Joi.exist().not('').required(),
    then: Joi.any().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'New passwords must match.',
      'any.required': 'Please confirm your new password.'
    }),
    otherwise: Joi.string().optional().allow('')
  })
});

// Helper function to render the dashboard with profile error and keep modal open
async function renderDashboardWithProfileError(req, errorMsg) {
  try {
    const token = req.cookies.token;
    if (!token) return req.res.redirect('/login');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    let transactions;
    if (user.role === 'admin') {
      transactions = await Transaction.find({}).sort({ date: -1 });
    } else {
      transactions = await Transaction.find({ user: user._id }).sort({ date: -1 });
    }
    transactions = await Transaction.populate(transactions, { path: 'user' });
    const totalTransactions = transactions.length;
    const totalIncome = transactions.reduce((sum, tx) => tx.type === 'income' ? sum + tx.amount : sum, 0);
    const totalExpense = transactions.reduce((sum, tx) => tx.type === 'expense' ? sum + tx.amount : sum, 0);
    // Render dashboard with error message and flag to keep profile modal open
    req.res.render('dashboard', { 
      user, 
      transactions, 
      totalTransactions, 
      totalIncome, 
      totalExpense,
      profileError: errorMsg,
      profileModalOpen: true
    });
  } catch (err) {
    console.error(err);
    req.res.send('Profile update failed.');
  }
}

exports.updateProfile = async (req, res) => {
  const { error, value } = profileSchema.validate(req.body);
  if (error) {
    console.error(error.details[0].message);
    return renderDashboardWithProfileError(req, error.details[0].message);
  }
  const { username, email, oldPassword, newPassword } = value;
  try {
    const currentUser = await User.findById(req.user.id);
    // Check if the email is changed and already exists
    if (email !== currentUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return renderDashboardWithProfileError(req, 'This email is already taken.');
      }
    }
    // If a password update is requested:
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
      if (!isMatch) {
        return renderDashboardWithProfileError(req, 'Old password is incorrect.');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      currentUser.password = hashedPassword;
    }
    currentUser.username = username;
    currentUser.email = email;
    await currentUser.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Profile update failed.');
  }
};
