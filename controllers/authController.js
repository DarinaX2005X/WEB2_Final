const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// GET /login
exports.loginView = (req, res) => {
  res.render('login', { error: null, formData: {} });
};

// POST /login
exports.loginPost = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Please fill in all fields.', formData: req.body });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'User not found.', formData: req.body });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render('login', { error: 'Incorrect password.', formData: req.body });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Login failed. Please try again.', formData: req.body });
  }
};

// GET /register
exports.registerView = (req, res) => {
  res.render('register', { error: null, formData: {} });
};

// POST /register
exports.registerPost = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return res.render('register', { error: 'Please fill in all fields.', formData: req.body });
  }
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.', formData: req.body });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters.', formData: req.body });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.render('register', { error: 'Email is already registered.', formData: req.body });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed. Please try again.', formData: req.body });
  }
};

// GET /logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
