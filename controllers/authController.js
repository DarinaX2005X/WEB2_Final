const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Joi schema for registration with custom messages
const registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Username is required.',
    'string.min': 'Username should be at least 2 characters.',
    'string.max': 'Username should be at most 50 characters.'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password should be at least 6 characters.'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
    'any.required': 'Please confirm your password.'
  })
});

// Joi schema for login with custom messages
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.'
  })
});

exports.loginView = (req, res) => {
  res.render('login', { error: null, formData: {} });
};

exports.loginPost = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.render('login', { error: error.details[0].message, formData: req.body });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.render('login', { error: 'User not found.', formData: req.body });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.render('login', { error: 'Incorrect password.', formData: req.body });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Login failed. Please try again.', formData: req.body });
  }
};

exports.registerView = (req, res) => {
  res.render('register', { error: null, formData: {} });
};

exports.registerPost = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  const formData = { username: req.body.username, email: req.body.email };
  if (error) {
    return res.render('register', { error: error.details[0].message, formData });
  }
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'Email is already registered.', formData });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed. Please try again.', formData });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
